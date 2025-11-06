import * as Sentry from "@sentry/node";
import { isNil, isNull } from "lodash";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import logger from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { debounce } from "../../helpers/Debounce";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import formatBody from "../../helpers/Mustache";
import TicketTraking from "../../models/TicketTraking";
import UserRating from "../../models/UserRating";
import SendWhatsAppCloudMessage from "./SendWhatsAppCloudMessage";
import moment from "moment";
import Queue from "../../models/Queue";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";
import Campaign from "../../models/Campaign";
import CampaignShipping from "../../models/CampaignShipping";
import { Op } from "sequelize";
import { campaignQueue, parseToMilliseconds, randomValue } from "../../queues";
import User from "../../models/User";
import { sayChatbot } from "../WbotServices/ChatBotListener";
import ListUserQueueServices from "../UserQueueServices/ListUserQueueServices";
import cacheLayer from "../../libs/cache";
import { addLogs } from "../../helpers/addLogs";
import SendWhatsAppCloudMedia from "./SendWhatsAppCloudMedia";
import CompaniesSettings from "../../models/CompaniesSettings";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";
import Whatsapp from "../../models/Whatsapp";
import QueueIntegrations from "../../models/QueueIntegrations";
import ShowFileService from "../FileServices/ShowService";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import BullQueues from "../../libs/queue";
import axios from "axios";

// Interface para mensagens recebidas via webhook da API oficial
interface WhatsAppCloudWebhookMessage {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: {
            body: string;
          };
          image?: {
            id: string;
            caption?: string;
            mime_type: string;
          };
          video?: {
            id: string;
            caption?: string;
            mime_type: string;
          };
          audio?: {
            id: string;
            mime_type: string;
          };
          document?: {
            id: string;
            caption?: string;
            filename: string;
            mime_type: string;
          };
          location?: {
            latitude: number;
            longitude: number;
            name?: string;
            address?: string;
          };
          contacts?: Array<{
            name: {
              formatted_name: string;
            };
            phones: Array<{
              phone: string;
            }>;
          }>;
          context?: {
            from: string;
            id: string;
          };
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

// Função para baixar mídia da API oficial
const downloadMediaFromWhatsApp = async (
  mediaId: string,
  whatsapp: Whatsapp
): Promise<Buffer> => {
  try {
    // Primeiro, obtém a URL da mídia
    const mediaUrl = `https://graph.facebook.com/v18.0/${mediaId}`;
    const response = await axios.get(mediaUrl, {
      headers: {
        Authorization: `Bearer ${whatsapp.token}`
      }
    });

    const mediaUrlDownload = response.data.url;

    // Baixa a mídia
    const mediaResponse = await axios.get(mediaUrlDownload, {
      headers: {
        Authorization: `Bearer ${whatsapp.token}`
      },
      responseType: "arraybuffer"
    });

    return Buffer.from(mediaResponse.data);
  } catch (err) {
    logger.error(`Erro ao baixar mídia ${mediaId}: ${err}`);
    throw err;
  }
};

export const whatsAppCloudMessageListener = (
  whatsapp: Whatsapp,
  companyId: number
): void => {
  // Esta função será chamada quando um webhook for recebido
  // O webhook será processado em um controller separado
  logger.info(`WhatsApp Cloud Message Listener inicializado para ${whatsapp.name}`);
};

// Função para processar mensagens recebidas via webhook
export const processWhatsAppCloudWebhook = async (
  webhookData: WhatsAppCloudWebhookMessage,
  companyId: number
): Promise<void> => {
  try {
    for (const entry of webhookData.entry) {
      for (const change of entry.changes) {
        const value = change.value;
        const phoneNumberId = value.metadata?.phone_number_id;

        // Encontra o WhatsApp correspondente
        const whatsapp = await Whatsapp.findOne({
          where: {
            phoneNumberId,
            companyId,
            channel: "whatsapp"
          }
        });

        if (!whatsapp) {
          logger.warn(`WhatsApp não encontrado para phoneNumberId: ${phoneNumberId}`);
          continue;
        }

        // Processa mensagens recebidas
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            await processIncomingMessage(message, whatsapp, companyId, value.contacts);
          }
        }

        // Processa status de mensagens (ack, delivered, read, etc)
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            await processMessageStatus(status, whatsapp, companyId);
          }
        }
      }
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Erro ao processar webhook WhatsApp Cloud: ${err}`);
  }
};

const processIncomingMessage = async (
  message: any,
  whatsapp: Whatsapp,
  companyId: number,
  contacts?: Array<any>
): Promise<void> => {
  try {
    const from = message.from.replace(/\D/g, "");
    const messageId = message.id;
    const timestamp = parseInt(message.timestamp) * 1000;
    const messageType = message.type;

    // Busca ou cria contato
    let contact = await Contact.findOne({
      where: {
        number: from,
        companyId
      }
    });

    if (!contact) {
      const contactName = contacts?.find(c => c.wa_id === from)?.profile?.name || from;
      
      contact = await CreateOrUpdateContactService({
        name: contactName,
        number: from,
        companyId,
        isGroup: false,
        remoteJid: `${from}@s.whatsapp.net`
      });
    }

    // Busca ou cria ticket
    const settings = await CompaniesSettings.findOne({
      where: { companyId }
    });

    const ticket = await FindOrCreateTicketService(
      contact,
      whatsapp,
      1, // unreadMessages
      companyId,
      null, // queueId
      null, // userId
      null, // groupContact
      "whatsapp", // channel
      false, // isImported
      false, // isForward
      settings || {}, // settings
      false // isCampaign
    );

    let messageBody = "";
    let mediaUrl = null;
    let mediaType = null;
    let mediaName = null;

    // Processa diferentes tipos de mensagem
    switch (messageType) {
      case "text":
        messageBody = message.text?.body || "";
        break;
      
      case "image":
        messageBody = message.image?.caption || "📷 Imagem";
        mediaType = "image";
        try {
          const mediaBuffer = await downloadMediaFromWhatsApp(message.image.id, whatsapp);
          const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
          const fileName = `${Date.now()}_${message.image.id}.jpg`;
          const filePath = path.join(publicFolder, `company${companyId}`, fileName);
          
          if (!fs.existsSync(path.join(publicFolder, `company${companyId}`))) {
            fs.mkdirSync(path.join(publicFolder, `company${companyId}`), { recursive: true });
          }
          
          fs.writeFileSync(filePath, mediaBuffer as any);
          mediaUrl = `/public/company${companyId}/${fileName}`;
          mediaName = fileName;
        } catch (err) {
          logger.error(`Erro ao baixar imagem: ${err}`);
        }
        break;
      
      case "video":
        messageBody = message.video?.caption || "🎥 Vídeo";
        mediaType = "video";
        try {
          const mediaBuffer = await downloadMediaFromWhatsApp(message.video.id, whatsapp);
          const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
          const fileName = `${Date.now()}_${message.video.id}.mp4`;
          const filePath = path.join(publicFolder, `company${companyId}`, fileName);
          
          if (!fs.existsSync(path.join(publicFolder, `company${companyId}`))) {
            fs.mkdirSync(path.join(publicFolder, `company${companyId}`), { recursive: true });
          }
          
          fs.writeFileSync(filePath, mediaBuffer as any);
          mediaUrl = `/public/company${companyId}/${fileName}`;
          mediaName = fileName;
        } catch (err) {
          logger.error(`Erro ao baixar vídeo: ${err}`);
        }
        break;
      
      case "audio":
        messageBody = "🎵 Áudio";
        mediaType = "audio";
        try {
          const mediaBuffer = await downloadMediaFromWhatsApp(message.audio.id, whatsapp);
          const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
          const fileName = `${Date.now()}_${message.audio.id}.ogg`;
          const filePath = path.join(publicFolder, `company${companyId}`, fileName);
          
          if (!fs.existsSync(path.join(publicFolder, `company${companyId}`))) {
            fs.mkdirSync(path.join(publicFolder, `company${companyId}`), { recursive: true });
          }
          
          fs.writeFileSync(filePath, mediaBuffer as any);
          mediaUrl = `/public/company${companyId}/${fileName}`;
          mediaName = fileName;
        } catch (err) {
          logger.error(`Erro ao baixar áudio: ${err}`);
        }
        break;
      
      case "document":
        messageBody = message.document?.caption || `📄 ${message.document?.filename || "Documento"}`;
        mediaType = "document";
        try {
          const mediaBuffer = await downloadMediaFromWhatsApp(message.document.id, whatsapp);
          const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
          const fileName = message.document?.filename || `${Date.now()}_${message.document.id}`;
          const filePath = path.join(publicFolder, `company${companyId}`, fileName);
          
          if (!fs.existsSync(path.join(publicFolder, `company${companyId}`))) {
            fs.mkdirSync(path.join(publicFolder, `company${companyId}`), { recursive: true });
          }
          
          fs.writeFileSync(filePath, mediaBuffer as any);
          mediaUrl = `/public/company${companyId}/${fileName}`;
          mediaName = fileName;
        } catch (err) {
          logger.error(`Erro ao baixar documento: ${err}`);
        }
        break;
      
      case "location":
        const location = message.location;
        messageBody = `📍 Localização\nLatitude: ${location.latitude}\nLongitude: ${location.longitude}${location.name ? `\nNome: ${location.name}` : ""}${location.address ? `\nEndereço: ${location.address}` : ""}`;
        break;
      
      case "contacts":
        const contactData = message.contacts?.[0];
        if (contactData) {
          const contactName = contactData.name?.formatted_name || "Contato";
          const contactPhone = contactData.phones?.[0]?.phone || "";
          messageBody = `👤 Contato compartilhado\nNome: ${contactName}\nTelefone: ${contactPhone}`;
        }
        break;
      
      default:
        messageBody = `Mensagem do tipo: ${messageType}`;
    }

    // Cria a mensagem no banco
    const messageData = {
      wid: messageId,
      ticketId: ticket.id,
      contactId: contact.id,
      body: messageBody,
      fromMe: false,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      read: false,
      quotedMsgId: message.context?.id || null,
      ack: 0,
      remoteJid: `${from}@s.whatsapp.net`,
      participant: null,
      dataJson: JSON.stringify(message),
      ticketTrakingId: null,
      isPrivate: false
    };

    await CreateMessageService({ messageData, companyId });

    // Atualiza ticket
    await ticket.update({
      lastMessage: messageBody,
      lastMessageAt: new Date(timestamp)
    });

    // Processa chatbot, filas, etc (similar ao wbotMessageListener)
    // ... código adicional para processar chatbot, filas, etc

    const io = getIO();
    io.of(String(companyId))
      .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket
      });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Erro ao processar mensagem recebida: ${err}`);
  }
};

const processMessageStatus = async (
  status: any,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  try {
    const messageId = status.id;
    const statusType = status.status; // sent, delivered, read, failed
    const recipientId = status.recipient_id.replace(/\D/g, "");

    // Encontra a mensagem no banco
    const message = await Message.findOne({
      where: {
        wid: messageId,
        companyId
      },
      include: [
        {
          model: Ticket,
          as: "ticket",
          where: {
            whatsappId: whatsapp.id
          }
        }
      ]
    });

    if (!message) {
      return;
    }

    let ack = 0;
    if (statusType === "sent") ack = 1;
    else if (statusType === "delivered") ack = 2;
    else if (statusType === "read") ack = 3;
    else if (statusType === "failed") ack = -1;

    await message.update({ ack });

    const io = getIO();
    io.of(String(companyId))
      .emit(`company-${companyId}-message`, {
        action: "update",
        message
      });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Erro ao processar status da mensagem: ${err}`);
  }
};

import fs from "fs";
import path from "path";

