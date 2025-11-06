import * as Sentry from "@sentry/node";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import { isNil } from "lodash";
import formatBody from "../../helpers/Mustache";
import axios from "axios";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  msdelay?: number;
  vCard?: Contact;
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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SendWhatsAppCloudMessage = async ({
  body,
  ticket,
  quotedMsg,
  msdelay,
  vCard,
  isForwarded = false
}: Request): Promise<WhatsAppCloudResponse> => {
  try {
    const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
    const phoneNumberId = (whatsapp as any).phoneNumberId;
    
    if (!whatsapp || !whatsapp.token || !phoneNumberId) {
      throw new AppError("ERR_WAPP_NOT_INITIALIZED");
    }

    const contactNumber = await Contact.findByPk(ticket.contactId);
    if (!contactNumber) {
      throw new AppError("ERR_CONTACT_NOT_FOUND");
    }

    // Formata o número para o formato da API (sem @s.whatsapp.net)
    let number: string = contactNumber.number.replace(/\D/g, "");
    
    // Se tiver remoteJid válido, extrai o número
    if (contactNumber.remoteJid && contactNumber.remoteJid.includes("@")) {
      number = contactNumber.remoteJid.split("@")[0];
    }

    const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const accessToken = whatsapp.token;

    // Se for vCard
    if (!isNil(vCard)) {
      const numberContact = vCard.number.replace(/\D/g, "");
      const firstName = vCard.name.split(' ')[0];
      const lastName = String(vCard.name).replace(vCard.name.split(' ')[0], '').trim();

      const vcard = `BEGIN:VCARD\n`
        + `VERSION:3.0\n`
        + `N:${lastName};${firstName};;;\n`
        + `FN:${vCard.name}\n`
        + `TEL;type=CELL;waid=${numberContact}:+${numberContact}\n`
        + `END:VCARD`;

      await delay(msdelay || 0);

      const response = await axios.post(
        apiUrl,
        {
          messaging_product: "whatsapp",
          to: number,
          type: "contacts",
          contacts: [
            {
              name: {
                formatted_name: vCard.name,
                first_name: firstName,
                last_name: lastName
              },
              phones: [
                {
                  phone: `+${numberContact}`,
                  wa_id: numberContact
                }
              ]
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      await ticket.update({ 
        lastMessage: formatBody(vcard, ticket), 
        imported: null 
      });

      return response.data;
    }

    // Mensagem de texto normal
    await delay(msdelay || 0);

    const messagePayload: any = {
      messaging_product: "whatsapp",
      to: number,
      type: "text",
      text: {
        body: formatBody(body, ticket)
      }
    };

    // Se houver mensagem citada (quoted)
    if (quotedMsg) {
      const chatMessages = await Message.findOne({
        where: {
          id: quotedMsg.id
        }
      });

      if (chatMessages) {
        const msgFound = JSON.parse(chatMessages.dataJson);
        
        // A API oficial usa context para mensagens citadas
        messagePayload.context = {
          message_id: msgFound.key?.id || msgFound.id
        };
      }
    }

    const response = await axios.post(
      apiUrl,
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    await ticket.update({ 
      lastMessage: formatBody(body, ticket), 
      imported: null 
    });

    return response.data;
  } catch (err: any) {
    console.log(`erro ao enviar mensagem na company ${ticket.companyId} - `, body,
      ticket,
      quotedMsg,
      msdelay,
      vCard,
      isForwarded);
    Sentry.captureException(err);
    console.log(err);
    
    if (err.response) {
      console.log("Erro da API WhatsApp:", err.response.data);
    }
    
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppCloudMessage;

