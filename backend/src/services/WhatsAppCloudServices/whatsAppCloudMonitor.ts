import Whatsapp from "../../models/Whatsapp";
import logger from "../../utils/logger";
import * as Sentry from "@sentry/node";
import axios from "axios";

const whatsAppCloudMonitor = async (
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  try {
    // Para a API oficial do WhatsApp, o monitoramento é feito via webhooks
    // Esta função pode ser usada para verificar periodicamente o status da conexão
    // ou fazer outras verificações necessárias
    
    logger.info(`WhatsApp Cloud Monitor inicializado para ${whatsapp.name}`);
    
    // Exemplo: Verificar status da conexão periodicamente
    setInterval(async () => {
      try {
        if (!whatsapp.token || !((whatsapp as any).phoneNumberId || whatsapp.number)) {
          return;
        }

        // Verifica se o número de telefone ainda está válido
        // Para API oficial, você pode usar o número ou um campo customizado
        const phoneNumberId = (whatsapp as any).phoneNumberId || whatsapp.number;
        
        if (!phoneNumberId) {
          return;
        }

        const verifyUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}`;
        
        const response = await axios.get(verifyUrl, {
          headers: {
            Authorization: `Bearer ${whatsapp.token}`
          },
          params: {
            fields: "verified_name,display_phone_number"
          }
        });

        logger.debug(`Status do WhatsApp ${whatsapp.name}: ${JSON.stringify(response.data)}`);
      } catch (err: any) {
        if (err.response?.status === 401) {
          // Token inválido ou expirado
          logger.error(`Token inválido para WhatsApp ${whatsapp.name}`);
          await whatsapp.update({ status: "DISCONNECTED" });
        } else {
          logger.error(`Erro ao verificar status do WhatsApp ${whatsapp.name}: ${err.message}`);
        }
      }
    }, 5 * 60 * 1000); // Verifica a cada 5 minutos

  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Erro no WhatsApp Cloud Monitor: ${err}`);
  }
};

export default whatsAppCloudMonitor;

