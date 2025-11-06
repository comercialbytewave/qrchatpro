import { Request, Response } from "express";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppCloudSession } from "../services/WhatsAppCloudServices/StartWhatsAppCloudSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import Whatsapp from "../models/Whatsapp";
import { getIO } from "../libs/socket";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
  
  // Verifica se é WhatsApp Cloud
  const phoneNumberId = (whatsapp as any).phoneNumberId;
  if (!phoneNumberId || !whatsapp.token) {
    return res.status(400).json({
      error: "Este WhatsApp não está configurado como WhatsApp Cloud API"
    });
  }

  await StartWhatsAppCloudSession(whatsapp, companyId);

  return res.status(200).json({ message: "Starting WhatsApp Cloud session." });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await Whatsapp.findOne({ 
    where: { id: whatsappId, companyId } 
  });

  if (!whatsapp) {
    return res.status(404).json({ error: "WhatsApp não encontrado" });
  }

  // Verifica se é WhatsApp Cloud
  const phoneNumberId = (whatsapp as any).phoneNumberId;
  if (!phoneNumberId || !whatsapp.token) {
    return res.status(400).json({
      error: "Este WhatsApp não está configurado como WhatsApp Cloud API"
    });
  }

  // Atualiza a sessão (limpa dados antigos se necessário)
  await whatsapp.update({ session: "" });
  
  // Reinicia a sessão WhatsApp Cloud
  await StartWhatsAppCloudSession(whatsapp, companyId);

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-whatsappSession`, {
      action: "update",
      session: whatsapp
    });

  return res.status(200).json({ message: "WhatsApp Cloud session restarted." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  // Verifica se é WhatsApp Cloud
  const phoneNumberId = (whatsapp as any).phoneNumberId;
  if (!phoneNumberId || !whatsapp.token) {
    return res.status(400).json({
      error: "Este WhatsApp não está configurado como WhatsApp Cloud API"
    });
  }

  // Para WhatsApp Cloud, apenas atualiza o status
  await whatsapp.update({ 
    status: "DISCONNECTED",
    qrcode: ""
  });

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-whatsappSession`, {
      action: "update",
      session: whatsapp
    });

  return res.status(200).json({ message: "WhatsApp Cloud session disconnected." });
};

export default { store, remove, update };


