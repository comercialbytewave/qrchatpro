import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import axios from "axios";
import Whatsapp from "../../models/Whatsapp";

const DeleteWhatsAppCloudMessage = async (
  messageId: string, 
  companyId?: string | number
): Promise<Message> => {
  const message = await Message.findOne({
    where: {
      id: messageId,
      companyId
    },
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new AppError("No message found with this ID.");
  }

  const { ticket } = message;

  if (!message.isPrivate) {
    try {
      const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
      const phoneNumberId = (whatsapp as any).phoneNumberId;
      
      if (!whatsapp || !whatsapp.token || !phoneNumberId) {
        throw new AppError("ERR_WAPP_NOT_INITIALIZED");
      }

      // A API oficial do WhatsApp permite deletar mensagens apenas para o próprio usuário
      // e apenas dentro de 7 dias após o envio
      const deleteUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
      
      const messageData = JSON.parse(message.dataJson || "{}");
      const whatsappMessageId = message.wid || messageData.id;

      if (!whatsappMessageId) {
        throw new AppError("ID da mensagem não encontrado");
      }

      await axios.post(
        deleteUrl,
        {
          messaging_product: "whatsapp",
          status: "deleted",
          message_id: whatsappMessageId
        },
        {
          headers: {
            Authorization: `Bearer ${whatsapp.token}`,
            "Content-Type": "application/json"
          }
        }
      );

      await message.update({ isDeleted: true });
    } catch (err: any) {
      console.log(err);
      
      if (err.response) {
        console.log("Erro da API WhatsApp:", err.response.data);
      }
      
      throw new AppError("ERR_DELETE_WAPP_MSG");
    }
  }

  return message;
};

export default DeleteWhatsAppCloudMessage;

