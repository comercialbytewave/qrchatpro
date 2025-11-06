import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";
import { StartWhatsAppCloudSession } from "./StartWhatsAppCloudSession";
import * as Sentry from "@sentry/node";

export const StartAllWhatsAppCloudSessions = async (
  companyId: number
): Promise<void> => {
  try {
    const whatsapps = await ListWhatsAppsService({ companyId });
    if (whatsapps.length > 0) {
      const promises = whatsapps.map(async (whatsapp) => {
        // Verifica se é WhatsApp Cloud (pode ter um campo específico ou usar phoneNumberId)
        const phoneNumberId = (whatsapp as any).phoneNumberId;
        const isCloudAPI = phoneNumberId && whatsapp.token && 
                          (whatsapp.channel === "whatsapp" || whatsapp.channel === "whatsapp-cloud");
        
        if (isCloudAPI && whatsapp.status !== "DISCONNECTED") {
          return StartWhatsAppCloudSession(whatsapp, companyId);
        }
      });
      // Aguarda a resolução de todas as promessas
      await Promise.all(promises);
    }
  } catch (e) {
    Sentry.captureException(e);
  }
};

