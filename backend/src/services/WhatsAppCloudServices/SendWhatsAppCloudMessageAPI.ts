import SendWhatsAppCloudMessage from "./SendWhatsAppCloudMessage";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Whatsapp from "../../models/Whatsapp";
import formatBody from "../../helpers/Mustache";

interface Request {
  body: string;
  whatsappId: number;
  contact: Contact;
  quotedMsg?: Message;
  msdelay?: number;
}

const SendWhatsAppCloudMessageAPI = async ({
  body,
  whatsappId,
  contact,
  quotedMsg,
  msdelay
}: Request): Promise<any> => {
  try {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    const phoneNumberId = (whatsapp as any).phoneNumberId;
    
    if (!whatsapp || !whatsapp.token || !phoneNumberId) {
      throw new Error("WhatsApp não configurado corretamente");
    }

    // Cria um ticket temporário para usar o SendWhatsAppCloudMessage
    // Ou adapta a lógica conforme necessário
    const number = contact.number.replace(/\D/g, "");
    
    const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const accessToken = whatsapp.token;

    const messagePayload: any = {
      messaging_product: "whatsapp",
      to: number,
      type: "text",
      text: {
        body: formatBody(body, null)
      }
    };

    // Se houver mensagem citada
    if (quotedMsg) {
      const msgFound = JSON.parse(quotedMsg.dataJson || "{}");
      messagePayload.context = {
        message_id: msgFound.id || quotedMsg.wid
      };
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

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw new Error("ERR_SENDING_WAPP_MSG");
  }
};

import axios from "axios";

export default SendWhatsAppCloudMessageAPI;

