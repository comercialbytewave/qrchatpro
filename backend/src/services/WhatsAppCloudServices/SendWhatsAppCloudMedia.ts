import * as Sentry from "@sentry/node";
import fs from "fs";
import path from "path";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import mime from "mime-types";
import Contact from "../../models/Contact";
import CreateMessageService from "../MessageServices/CreateMessageService";
import formatBody from "../../helpers/Mustache";
import axios from "axios";
import Whatsapp from "../../models/Whatsapp";
import FormData from "form-data";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  companyId?: number;
  body?: string;
  isPrivate?: boolean;
  isForwarded?: boolean;
}

interface WhatsAppCloudResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const SendWhatsAppCloudMedia = async ({
  media,
  ticket,
  body = "",
  isPrivate = false,
  isForwarded = false
}: Request): Promise<WhatsAppCloudResponse> => {
  try {
    const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
    const phoneNumberId = (whatsapp as any).phoneNumberId;
    
    if (!whatsapp || !whatsapp.token || !phoneNumberId) {
      throw new AppError("ERR_WAPP_NOT_INITIALIZED");
    }

    const companyId = ticket.companyId.toString();
    const pathMedia = media.path;
    const typeMessage = media.mimetype.split("/")[0];
    const bodyMedia = ticket ? formatBody(body, ticket) : body;

    const contactNumber = await Contact.findByPk(ticket.contactId);
    if (!contactNumber) {
      throw new AppError("ERR_CONTACT_NOT_FOUND");
    }

    let number: string = contactNumber.number.replace(/\D/g, "");
    
    if (contactNumber.remoteJid && contactNumber.remoteJid.includes("@")) {
      number = contactNumber.remoteJid.split("@")[0];
    }

    const accessToken = whatsapp.token;

    // Se for mensagem privada, apenas cria no banco
    if (isPrivate === true) {
      const messageData = {
        wid: `PVT${companyId}${ticket.id}${body.substring(0, 6)}`,
        ticketId: ticket.id,
        contactId: undefined,
        body: bodyMedia,
        fromMe: true,
        mediaUrl: media.filename,
        mediaType: media.mimetype.split("/")[0],
        read: true,
        quotedMsgId: null,
        ack: 2,
        remoteJid: null,
        participant: null,
        dataJson: null,
        ticketTrakingId: null,
        isPrivate
      };

      await CreateMessageService({ messageData, companyId: ticket.companyId });
      return;
    }

    // Upload da mídia para a API do WhatsApp
    const mediaUploadUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/media`;
    
    const formData = new FormData();
    formData.append("file", fs.createReadStream(pathMedia), {
      filename: media.originalname.replace('/', '-'),
      contentType: media.mimetype
    });
    formData.append("messaging_product", "whatsapp");
    formData.append("type", media.mimetype);

    // Faz upload da mídia
    const uploadResponse = await axios.post(mediaUploadUrl, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...formData.getHeaders()
      }
    });

    const mediaId = uploadResponse.data.id;

    // Determina o tipo de mídia e prepara o payload
    let messagePayload: any = {
      messaging_product: "whatsapp",
      to: number,
    };

    if (typeMessage === "video") {
      messagePayload.type = "video";
      messagePayload.video = {
        id: mediaId,
        caption: bodyMedia || undefined
      };
    } else if (typeMessage === "audio") {
      messagePayload.type = "audio";
      messagePayload.audio = {
        id: mediaId
      };
    } else if (typeMessage === "document" || typeMessage === "application" || typeMessage === "text") {
      messagePayload.type = "document";
      messagePayload.document = {
        id: mediaId,
        caption: bodyMedia || undefined,
        filename: media.originalname.replace('/', '-')
      };
    } else {
      // Imagem
      messagePayload.type = "image";
      messagePayload.image = {
        id: mediaId,
        caption: bodyMedia || undefined
      };
    }

    // Envia a mensagem com a mídia
    const messagesUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    
    const response = await axios.post(
      messagesUrl,
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    await ticket.update({ 
      lastMessage: body !== media.filename ? body : bodyMedia, 
      imported: null 
    });

    return response.data;
  } catch (err: any) {
    console.log(`ERRO AO ENVIAR MIDIA ${ticket.id} media ${media.originalname}`);
    Sentry.captureException(err);
    console.log(err);
    
    if (err.response) {
      console.log("Erro da API WhatsApp:", err.response.data);
    }
    
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppCloudMedia;

