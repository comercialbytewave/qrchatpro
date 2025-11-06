import path from "path";
import fs from "fs";
import * as Sentry from "@sentry/node";
import { isNil } from "lodash";
import { Mutex } from "async-mutex";
import axios from "axios";
import moment from "moment";
import { Op } from "sequelize";

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import logger from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import formatBody from "../../helpers/Mustache";
import TicketTraking from "../../models/TicketTraking";
import SendWhatsAppCloudMessage from "./SendWhatsAppCloudMessage";
import Queue from "../../models/Queue";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";
import User from "../../models/User";
import { sayChatbot } from "../WbotServices/ChatBotListener";
import cacheLayer from "../../libs/cache";
import SendWhatsAppCloudMedia from "./SendWhatsAppCloudMedia";
import CompaniesSettings from "../../models/CompaniesSettings";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";
import Whatsapp from "../../models/Whatsapp";
import QueueIntegrations from "../../models/QueueIntegrations";
import ShowQueueIntegrationService from "../QueueIntegrationServices/ShowQueueIntegrationService";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import { REDIS_URI_MSG_CONN } from "../../config/redis";
import BullQueues from "../../libs/queue";

// Interface para mensagens recebidas via webhook da API oficial
interface WhatsAppCloudMessage {
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
  button?: {
    text: string;
    payload?: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
    };
  };
}

interface WhatsAppCloudContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

// Função para baixar mídia da API oficial
const downloadMediaFromWhatsApp = async (
  mediaId: string,
  whatsapp: Whatsapp
): Promise<Buffer> => {
  try {
    const phoneNumberId = (whatsapp as any).phoneNumberId;
    if (!whatsapp.token || !phoneNumberId) {
      throw new Error("WhatsApp não configurado corretamente");
    }

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

// Função para obter o corpo da mensagem baseado no tipo
const getBodyMessage = (message: WhatsAppCloudMessage): string => {
  switch (message.type) {
    case "text":
      return message.text?.body || "";
    
    case "image":
      return message.image?.caption || "📷 Imagem";
    
    case "video":
      return message.video?.caption || "🎥 Vídeo";
    
    case "audio":
      return "🎵 Áudio";
    
    case "document":
      return message.document?.caption || `📄 ${message.document?.filename || "Documento"}`;
    
    case "location":
      const location = message.location;
      return `📍 Localização\nLatitude: ${location?.latitude}\nLongitude: ${location?.longitude}${location?.name ? `\nNome: ${location.name}` : ""}${location?.address ? `\nEndereço: ${location.address}` : ""}`;
    
    case "contacts":
      const contactData = message.contacts?.[0];
      if (contactData) {
        const contactName = contactData.name?.formatted_name || "Contato";
        const contactPhone = contactData.phones?.[0]?.phone || "";
        return `👤 Contato compartilhado\nNome: ${contactName}\nTelefone: ${contactPhone}`;
      }
      return "👤 Contato compartilhado";
    
    case "button":
      return message.button?.text || "Botão";
    
    case "interactive":
      if (message.interactive?.button_reply) {
        return message.interactive.button_reply.title;
      }
      if (message.interactive?.list_reply) {
        return message.interactive.list_reply.title;
      }
      return "Mensagem interativa";
    
    default:
      return `Mensagem do tipo: ${message.type}`;
  }
};

// Função para verificar e criar/atualizar contato
const verifyContact = async (
  from: string,
  whatsapp: Whatsapp,
  companyId: number,
  contactInfo?: WhatsAppCloudContact
): Promise<Contact> => {
  const number = from.replace(/\D/g, "");
  const contactName = contactInfo?.profile?.name || number;

  const contactData = {
    name: contactName,
    number: number,
    profilePicUrl: "",
    isGroup: false,
    companyId,
    remoteJid: `${number}@s.whatsapp.net`,
    whatsappId: whatsapp.id
  };

  const contact = await CreateOrUpdateContactService(contactData);
  return contact;
};

// Função para verificar mensagem de texto
const verifyMessage = async (
  message: WhatsAppCloudMessage,
  ticket: Ticket,
  contact: Contact,
  ticketTraking?: TicketTraking,
  isPrivate?: boolean,
  isForwarded: boolean = false
): Promise<void> => {
  const io = getIO();
  const body = getBodyMessage(message);
  const companyId = ticket.companyId;
  const messageId = message.id;
  const timestamp = parseInt(message.timestamp) * 1000;

  // Verifica se há mensagem citada
  let quotedMsgId = null;
  if (message.context?.id) {
    const quotedMsg = await Message.findOne({
      where: {
        wid: message.context.id,
        companyId
      }
    });
    if (quotedMsg) {
      quotedMsgId = quotedMsg.id;
    }
  }

  const messageData = {
    wid: messageId,
    ticketId: ticket.id,
    contactId: contact.id,
    body,
    fromMe: false,
    mediaType: message.type,
    read: false,
    quotedMsgId,
    ack: 0,
    remoteJid: `${contact.number}@s.whatsapp.net`,
    participant: null,
    dataJson: JSON.stringify(message),
    ticketTrakingId: ticketTraking?.id,
    isPrivate,
    createdAt: new Date(timestamp).toISOString(),
    ticketImported: ticket.imported || false,
    isForwarded
  };

  await ticket.update({
    lastMessage: body
  });

  await CreateMessageService({ messageData, companyId });

  if (ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" },
        { model: Whatsapp, as: "whatsapp" }
      ]
    });

    if (!ticket.imported) {
      io.of(String(companyId))
        .emit(`company-${companyId}-ticket`, {
          action: "update",
          ticket,
          ticketId: ticket.id
        });
    }
  }
};

// Função para verificar mensagem com mídia
const verifyMediaMessage = async (
  message: WhatsAppCloudMessage,
  ticket: Ticket,
  contact: Contact,
  ticketTraking: TicketTraking,
  whatsapp: Whatsapp,
  companyId: number,
  isForwarded: boolean = false,
  isPrivate?: boolean
): Promise<Message | undefined> => {
  try {
    let mediaBuffer: Buffer | null = null;
    let mediaType = "";
    let fileName = "";
    let mimeType = "";

    switch (message.type) {
      case "image":
        mediaType = "image";
        mimeType = message.image?.mime_type || "image/jpeg";
        fileName = `${Date.now()}_${message.image?.id}.jpg`;
        mediaBuffer = await downloadMediaFromWhatsApp(message.image!.id, whatsapp);
        break;

      case "video":
        mediaType = "video";
        mimeType = message.video?.mime_type || "video/mp4";
        fileName = `${Date.now()}_${message.video?.id}.mp4`;
        mediaBuffer = await downloadMediaFromWhatsApp(message.video!.id, whatsapp);
        break;

      case "audio":
        mediaType = "audio";
        mimeType = message.audio?.mime_type || "audio/ogg";
        fileName = `${Date.now()}_${message.audio?.id}.ogg`;
        mediaBuffer = await downloadMediaFromWhatsApp(message.audio!.id, whatsapp);
        break;

      case "document":
        mediaType = "document";
        mimeType = message.document?.mime_type || "application/pdf";
        fileName = message.document?.filename || `${Date.now()}_${message.document?.id}`;
        mediaBuffer = await downloadMediaFromWhatsApp(message.document!.id, whatsapp);
        break;

      default:
        return undefined;
    }

    if (!mediaBuffer) {
      return undefined;
    }

    // Salva o arquivo na pasta pública
    const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
    const companyFolder = path.join(publicFolder, `company${companyId}`);
    
    if (!fs.existsSync(companyFolder)) {
      fs.mkdirSync(companyFolder, { recursive: true });
    }

    const filePath = path.join(companyFolder, fileName);
    fs.writeFileSync(filePath, mediaBuffer);

    const body = getBodyMessage(message);
    const messageId = message.id;
    const timestamp = parseInt(message.timestamp) * 1000;

    // Verifica se há mensagem citada
    let quotedMsgId = null;
    if (message.context?.id) {
      const quotedMsg = await Message.findOne({
        where: {
          wid: message.context.id,
          companyId
        }
      });
      if (quotedMsg) {
        quotedMsgId = quotedMsg.id;
      }
    }

    const messageData = {
      wid: messageId,
      ticketId: ticket.id,
      contactId: contact.id,
      body: body || fileName,
      fromMe: false,
      mediaUrl: `/public/company${companyId}/${fileName}`,
      mediaType: mediaType,
      read: false,
      quotedMsgId,
      ack: 0,
      remoteJid: `${contact.number}@s.whatsapp.net`,
      participant: null,
      dataJson: JSON.stringify(message),
      ticketTrakingId: ticketTraking?.id,
      createdAt: new Date(timestamp).toISOString(),
      ticketImported: ticket.imported || false,
      isForwarded,
      isPrivate
    };

    await ticket.update({
      lastMessage: body || fileName
    });

    const newMessage = await CreateMessageService({
      messageData,
      companyId
    });

    if (ticket.status === "closed") {
      await ticket.update({ status: "pending" });
      await ticket.reload({
        include: [
          { model: Queue, as: "queue" },
          { model: User, as: "user" },
          { model: Contact, as: "contact" },
          { model: Whatsapp, as: "whatsapp" }
        ]
      });

      if (!ticket.imported) {
        const io = getIO();
        io.of(String(companyId))
          .emit(`company-${companyId}-ticket`, {
            action: "update",
            ticket,
            ticketId: ticket.id
          });
      }
    }

    return newMessage;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Erro ao processar mídia: ${err}`);
    return undefined;
  }
};

// Função para verificar fila e chatbot (similar ao verifyQueue do wbotMessageListener)
const verifyQueue = async (
  message: WhatsAppCloudMessage,
  whatsapp: Whatsapp,
  ticket: Ticket,
  contact: Contact,
  settings: CompaniesSettings,
  ticketTraking: TicketTraking,
  companyId: number
): Promise<void> => {
  const { queues, greetingMessage, maxUseBotQueues, timeUseBotQueues } = await ShowWhatsAppService(
    whatsapp.id!,
    companyId
  );

  let chatbot = false;
  if (queues.length === 1) {
    chatbot = queues[0]?.chatbots.length > 1;
  }

  const enableQueuePosition = settings.sendQueuePosition === "enabled";

  if (queues.length === 1 && !chatbot) {
    const sendGreetingMessageOneQueues = settings.sendGreetingMessageOneQueues === "enabled" || false;

    // Inicia integração dialogflow/n8n
    if (queues[0].integrationId) {
      const integrations = await ShowQueueIntegrationService(queues[0].integrationId, companyId);
      // TODO: Implementar handleMessageIntegration para Cloud API
      await ticket.update({
        useIntegration: true,
        integrationId: integrations.id
      });
    }

    if (greetingMessage.length > 1 && sendGreetingMessageOneQueues) {
      const body = formatBody(`\u200e${greetingMessage}`, ticket);
      await SendWhatsAppCloudMessage({ body, ticket });
    }

    await UpdateTicketService({
      ticketData: { queueId: queues[0].id },
      ticketId: ticket.id,
      companyId: companyId
    });

    return;
  }

  if (queues.length > 1) {
    const bodyMessage = getBodyMessage(message);
    const selectedOption = parseInt(bodyMessage);

    if (selectedOption > 0 && selectedOption <= queues.length) {
      await UpdateTicketService({
        ticketData: { queueId: queues[selectedOption - 1].id },
        ticketId: ticket.id,
        companyId: companyId
      });

      const selectedQueue = queues[selectedOption - 1];
      if (selectedQueue.greetingMessage) {
        const body = formatBody(`\u200e${selectedQueue.greetingMessage}`, ticket);
        await SendWhatsAppCloudMessage({ body, ticket });
      }

      return;
    }

    if (bodyMessage.toLowerCase() === "sair") {
      await ticket.update({ status: "closed" });
      return;
    }

    // Mostra menu de filas
    let options = "";
    queues.forEach((queue, index) => {
      options += `*[ ${index + 1} ]* - ${queue.name}\n`;
    });
    options += `\n*[ Sair ]* - Encerrar atendimento`;

    const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);

    await CreateLogTicketService({
      ticketId: ticket.id,
      type: "chatBot"
    });

    await SendWhatsAppCloudMessage({ body, ticket });
  }
};

// Função principal para processar mensagem recebida
const handleMessage = async (
  message: WhatsAppCloudMessage,
  whatsapp: Whatsapp,
  companyId: number,
  contactInfo?: WhatsAppCloudContact,
  isImported: boolean = false
): Promise<void> => {
  try {
    const from = message.from.replace(/\D/g, "");
    const messageId = message.id;
    const messageType = message.type;

    // Verifica se a mensagem já existe
    const messageExists = await Message.count({
      where: { wid: messageId, companyId }
    });

    if (messageExists) {
      return;
    }

    // Busca ou cria contato
    const contact = await verifyContact(from, whatsapp, companyId, contactInfo);

    let unreadMessages = 0;
    const unreads = await cacheLayer.get(`contacts:${contact.id}:unreads`);
    unreadMessages = +unreads + 1;
    await cacheLayer.set(`contacts:${contact.id}:unreads`, `${unreadMessages}`);

    // Busca configurações da empresa
    const settings = await CompaniesSettings.findOne({
      where: { companyId }
    });

    if (!settings) {
      logger.error(`Configurações não encontradas para companyId: ${companyId}`);
      return;
    }

    // Verifica se é primeira mensagem
    const isFirstMsg = await Ticket.findOne({
      where: {
        contactId: contact.id,
        companyId,
        whatsappId: whatsapp.id
      },
      order: [["id", "DESC"]]
    });

    // Busca ou cria ticket
    const mutex = new Mutex();
    const ticket = await mutex.runExclusive(async () => {
      const result = await FindOrCreateTicketService(
        contact,
        whatsapp,
        unreadMessages,
        companyId,
        null, // queueId
        null, // userId
        null, // groupContact
        "whatsapp", // channel
        isImported,
        false, // isForward
        settings,
        false // isCampaign
      );
      return result;
    });

    // Busca ou cria ticket tracking
    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      userId: null,
      whatsappId: whatsapp.id
    });

    // Verifica mensagem de férias coletivas
    if (!isNil(whatsapp.collectiveVacationMessage)) {
      const currentDate = moment();
      if (currentDate.isBetween(
        moment(whatsapp.collectiveVacationStart),
        moment(whatsapp.collectiveVacationEnd)
      )) {
        if (messageType === "text" || messageType === "image" || messageType === "video" || messageType === "audio" || messageType === "document") {
          if (messageType === "text") {
            await verifyMessage(message, ticket, contact, ticketTraking);
          } else {
            await verifyMediaMessage(message, ticket, contact, ticketTraking, whatsapp, companyId);
          }
        }

        await SendWhatsAppCloudMessage({
          body: whatsapp.collectiveVacationMessage,
          ticket
        });

        return;
      }
    }

    // Processa mensagem (texto ou mídia)
    let mediaSent: Message | undefined;
    const hasMedia = ["image", "video", "audio", "document"].includes(messageType);

    if (hasMedia) {
      mediaSent = await verifyMediaMessage(
        message,
        ticket,
        contact,
        ticketTraking,
        whatsapp,
        companyId,
        false,
        false
      );
    } else {
      await verifyMessage(message, ticket, contact, ticketTraking);
    }

    // Atualiza ticket
    await ticket.update({
      fromMe: false
    });

    // Verifica horário de atendimento
    let currentSchedule;
    if (settings.scheduleType === "company") {
      currentSchedule = await VerifyCurrentSchedule(companyId, 0, 0);
    } else if (settings.scheduleType === "connection") {
      currentSchedule = await VerifyCurrentSchedule(companyId, 0, whatsapp.id);
    }

    // Processa chatbot e filas
    if (
      !ticket.imported &&
      !ticket.queue &&
      !ticket.userId &&
      whatsapp.queues.length >= 1 &&
      !ticket.useIntegration
    ) {
      await verifyQueue(message, whatsapp, ticket, contact, settings, ticketTraking, companyId);

      if (ticketTraking.chatbotAt === null) {
        await ticketTraking.update({
          chatbotAt: moment().toDate()
        });
      }
    }

    if (ticket.queueId > 0) {
      await ticketTraking.update({
        queueId: ticket.queueId
      });
    }

    // Emite evento via socket
    const io = getIO();
    io.of(String(companyId))
      .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Erro ao processar mensagem WhatsApp Cloud: ${err}`);
  }
};

// Função principal para processar webhook
export const processWhatsAppCloudWebhook = async (
  webhookData: any,
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
            companyId
          },
          include: [{ model: Queue, as: "queues" }]
        });

        if (!whatsapp) {
          logger.warn(`WhatsApp não encontrado para phoneNumberId: ${phoneNumberId}`);
          continue;
        }

        // Processa mensagens recebidas
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            // Verifica se deve processar via fila Redis
            if (REDIS_URI_MSG_CONN !== '') {
              try {
                await BullQueues.add(
                  `${process.env.DB_NAME}-handleWhatsAppCloudMessage`,
                  { message, whatsappId: whatsapp.id, companyId, contacts: value.contacts },
                  {
                    priority: 1,
                    jobId: `whatsapp-cloud-${whatsapp.id}-handleMessage-${message.id}`
                  }
                );
              } catch (e) {
                Sentry.captureException(e);
                // Fallback: processa diretamente
                await handleMessage(message, whatsapp, companyId, value.contacts?.[0]);
              }
            } else {
              await handleMessage(message, whatsapp, companyId, value.contacts?.[0]);
            }
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

// Função para processar status de mensagens
const processMessageStatus = async (
  status: any,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  try {
    const messageId = status.id;
    const statusType = status.status; // sent, delivered, read, failed
    const recipientId = status.recipient_id?.replace(/\D/g, "");

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
      .emit(`company-${companyId}-appMessage`, {
        action: "update",
        message
      });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Erro ao processar status da mensagem: ${err}`);
  }
};

export { handleMessage, verifyMessage, verifyMediaMessage, verifyContact, getBodyMessage };

