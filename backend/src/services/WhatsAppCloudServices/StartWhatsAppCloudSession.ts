import Whatsapp from "../../models/Whatsapp";
import { getIO } from "../../libs/socket";
import logger from "../../utils/logger";
import * as Sentry from "@sentry/node";
// O processamento de mensagens é feito via webhook, não precisa de listener ativo
import whatsAppCloudMonitor from "./whatsAppCloudMonitor";

export const StartWhatsAppCloudSession = async (
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-whatsappSession`, {
      action: "update",
      session: whatsapp
    });

  try {
    // Para API oficial do WhatsApp, não precisamos inicializar socket
    // A conexão é feita via webhooks e requisições HTTP
    // Verificamos se temos os dados necessários (token, phoneNumberId, etc)
    // phoneNumberId pode ser um campo customizado ou pode ser armazenado em outro campo
    const phoneNumberId = (whatsapp as any).phoneNumberId;
    
    if (!whatsapp.token || !phoneNumberId) {
      await whatsapp.update({ 
        status: "DISCONNECTED",
        qrcode: ""
      });
      
      io.of(String(companyId))
        .emit(`company-${companyId}-whatsappSession`, {
          action: "update",
          session: whatsapp
        });
      
      throw new Error("Token ou Phone Number ID não configurados");
    }

    // Inicializa o listener de webhooks
    // O processamento de mensagens é feito via webhook no controller
    // Não é necessário inicializar um listener como no Baileys
    
    // Inicializa o monitor
    whatsAppCloudMonitor(whatsapp, companyId);

    // Atualiza status para conectado
    await whatsapp.update({
      status: "CONNECTED",
      qrcode: "",
      retries: 0,
      number: phoneNumberId || "-"
    });

    io.of(String(companyId))
      .emit(`company-${companyId}-whatsappSession`, {
        action: "update",
        session: whatsapp
      });

    logger.info(`WhatsApp Cloud Session ${whatsapp.name} iniciada com sucesso`);
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Erro ao iniciar sessão WhatsApp Cloud: ${err}`);
    
    await whatsapp.update({ 
      status: "DISCONNECTED",
      qrcode: ""
    });

    io.of(String(companyId))
      .emit(`company-${companyId}-whatsappSession`, {
        action: "update",
        session: whatsapp
      });
  }
};

