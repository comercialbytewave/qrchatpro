import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import cacheLayer from "../libs/cache";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import ShowPlanService from "../services/PlanService/ShowPlanService";
import { StartWhatsAppCloudSession } from "../services/WhatsAppCloudServices/StartWhatsAppCloudSession";

import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import { closeTicketsImported } from "../services/WhatsappService/ImportWhatsAppMessageService";
import ShowWhatsAppServiceAdmin from "../services/WhatsappService/ShowWhatsAppServiceAdmin";
import UpdateWhatsAppServiceAdmin from "../services/WhatsappService/UpdateWhatsAppServiceAdmin";
import ListAllWhatsAppsService from "../services/WhatsappService/ListAllWhatsAppService";
import ListFilterWhatsAppsService from "../services/WhatsappService/ListFilterWhatsAppsService";
import User from "../models/User";
import { processWhatsAppCloudWebhook } from "../services/WhatsAppCloudServices/whatsAppCloudMessageProcessor";

interface WhatsappCloudData {
  name: string;
  queueIds: number[];
  companyId: number;
  greetingMessage?: string;
  complationMessage?: string;
  outOfHoursMessage?: string;
  status?: string;
  isDefault?: boolean;
  token?: string;
  phoneNumberId?: string; // Campo específico para API oficial
  maxUseBotQueues?: string;
  timeUseBotQueues?: string;
  expiresTicket?: number;
  allowGroup?: false;
  sendIdQueue?: number;
  timeSendQueue?: number;
  timeInactiveMessage?: string;
  inactiveMessage?: string;
  ratingMessage?: string;
  maxUseBotQueuesNPS?: number;
  expiresTicketNPS?: number;
  whenExpiresTicket?: string;
  expiresInactiveMessage?: string;
  importOldMessages?: string;
  importRecentMessages?: string;
  importOldMessagesGroups?: boolean;
  closedTicketsPostImported?: boolean;
  groupAsTicket?: string;
  timeCreateNewTicket?: number;
  schedules?: any[];
  promptId?: number;
  collectiveVacationMessage?: string;
  collectiveVacationStart?: string;
  collectiveVacationEnd?: string;
  queueIdImportMessages?: number;
  flowIdNotPhrase?: number;
  flowIdWelcome?: number;
}

interface QueryParams {
  session?: number | string;
  channel?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { session } = req.query as QueryParams;
  const whatsapps = await ListWhatsAppsService({ companyId, session });

  // Filtra apenas WhatsApp Cloud
  const cloudWhatsapps = whatsapps.filter(
    (w: any) => (w as any).phoneNumberId && w.token
  );

  return res.status(200).json(cloudWhatsapps);
};

export const indexFilter = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { session, channel } = req.query as QueryParams;

  const whatsapps = await ListFilterWhatsAppsService({ companyId, session, channel });

  // Filtra apenas WhatsApp Cloud
  const cloudWhatsapps = whatsapps.filter(
    (w: any) => (w as any).phoneNumberId && w.token
  );

  return res.status(200).json(cloudWhatsapps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    status,
    isDefault,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    queueIds,
    token,
    phoneNumberId,
    maxUseBotQueues,
    timeUseBotQueues,
    expiresTicket,
    allowGroup,
    timeSendQueue,
    sendIdQueue,
    timeInactiveMessage,
    inactiveMessage,
    ratingMessage,
    maxUseBotQueuesNPS,
    expiresTicketNPS,
    whenExpiresTicket,
    expiresInactiveMessage,
    importOldMessages,
    importRecentMessages,
    closedTicketsPostImported,
    importOldMessagesGroups,
    groupAsTicket,
    timeCreateNewTicket,
    schedules,
    promptId,
    collectiveVacationEnd,
    collectiveVacationMessage,
    collectiveVacationStart,
    queueIdImportMessages,
    flowIdNotPhrase,
    flowIdWelcome
  }: WhatsappCloudData = req.body;
  const { companyId } = req.user;

  const company = await ShowCompanyService(companyId);
  const plan = await ShowPlanService(company.planId);

  if (!plan.useWhatsapp) {
    return res.status(400).json({
      error: "Você não possui permissão para acessar este recurso!"
    });
  }

  // Validação específica para API oficial
  if (!token || !phoneNumberId) {
    return res.status(400).json({
      error: "Token e Phone Number ID são obrigatórios para WhatsApp Cloud API"
    });
  }

  const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsAppService({
    name,
    status: status || "DISCONNECTED",
    isDefault,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    queueIds,
    companyId,
    token,
    phoneNumberId,
    maxUseBotQueues,
    timeUseBotQueues,
    expiresTicket,
    allowGroup,
    timeSendQueue,
    sendIdQueue,
    timeInactiveMessage,
    inactiveMessage,
    ratingMessage,
    maxUseBotQueuesNPS,
    expiresTicketNPS,
    whenExpiresTicket,
    expiresInactiveMessage,
    importOldMessages,
    importRecentMessages,
    closedTicketsPostImported,
    importOldMessagesGroups,
    groupAsTicket,
    timeCreateNewTicket,
    schedules,
    promptId,
    collectiveVacationEnd,
    collectiveVacationMessage,
    collectiveVacationStart,
    queueIdImportMessages,
    flowIdNotPhrase,
    flowIdWelcome,
    channel: "whatsapp-cloud"
  });

  // Inicia a sessão WhatsApp Cloud
  await StartWhatsAppCloudSession(whatsapp, companyId);

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp
    });

  if (oldDefaultWhatsapp) {
    io.of(String(companyId))
      .emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp: oldDefaultWhatsapp
      });
  }

  return res.status(200).json(whatsapp);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const { session } = req.query;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId, session);

  // Verifica se é WhatsApp Cloud
  const phoneNumberId = (whatsapp as any).phoneNumberId;
  if (!phoneNumberId || !whatsapp.token) {
    return res.status(400).json({
      error: "Este WhatsApp não está configurado como WhatsApp Cloud API"
    });
  }

  return res.status(200).json(whatsapp);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { companyId } = req.user;

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppService({
    whatsappData: {
      ...whatsappData,
      phoneNumberId: whatsappData.phoneNumberId
    },
    whatsappId,
    companyId
  });

  // Reinicia a sessão se necessário
  if (whatsappData.token || whatsappData.phoneNumberId) {
    await StartWhatsAppCloudSession(whatsapp, companyId);
  }

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp
    });

  if (oldDefaultWhatsapp) {
    io.of(String(companyId))
      .emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp: oldDefaultWhatsapp
      });
  }

  return res.status(200).json(whatsapp);
};

export const closedTickets = async (req: Request, res: Response) => {
  const { whatsappId } = req.params;

  closeTicketsImported(whatsappId);

  return res.status(200).json("whatsapp");
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId, profile } = req.user;
  const io = getIO();

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
  const phoneNumberId = (whatsapp as any).phoneNumberId;

  if (phoneNumberId && whatsapp.token) {
    // É WhatsApp Cloud
    await DeleteWhatsAppService(whatsappId);
    await cacheLayer.delFromPattern(`sessions:${whatsappId}:*`);

    io.of(String(companyId))
      .emit(`company-${companyId}-whatsapp`, {
        action: "delete",
        whatsappId: +whatsappId
      });
  }

  return res.status(200).json({ message: "Session disconnected." });
};

export const restart = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, profile, id } = req.user;

  const user = await User.findByPk(id);
  const { allowConnections } = user;

  if (profile !== "admin" && allowConnections === "disabled") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  // Reinicia todas as sessões WhatsApp Cloud
  const whatsapps = await ListWhatsAppsService({ companyId });
  const cloudWhatsapps = whatsapps.filter(
    (w: any) => (w as any).phoneNumberId && w.token
  );

  for (const whatsapp of cloudWhatsapps) {
    await StartWhatsAppCloudSession(whatsapp, companyId);
  }

  return res.status(200).json({ message: "WhatsApp Cloud restart." });
};

export const listAll = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { session } = req.query as QueryParams;
  const whatsapps = await ListAllWhatsAppsService({ session });

  // Filtra apenas WhatsApp Cloud
  const cloudWhatsapps = whatsapps.filter(
    (w: any) => (w as any).phoneNumberId && w.token
  );

  return res.status(200).json(cloudWhatsapps);
};

export const updateAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { companyId } = req.user;

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppServiceAdmin({
    whatsappData: {
      ...whatsappData,
      phoneNumberId: whatsappData.phoneNumberId
    },
    whatsappId,
    companyId
  });

  const io = getIO();
  io.of(String(companyId))
    .emit(`admin-whatsapp`, {
      action: "update",
      whatsapp
    });

  if (oldDefaultWhatsapp) {
    io.of(String(companyId))
      .emit(`admin-whatsapp`, {
        action: "update",
        whatsapp: oldDefaultWhatsapp
      });
  }

  return res.status(200).json(whatsapp);
};

export const removeAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const io = getIO();

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
  const phoneNumberId = (whatsapp as any).phoneNumberId;

  if (phoneNumberId && whatsapp.token) {
    // É WhatsApp Cloud
    await DeleteWhatsAppService(whatsappId);
    await cacheLayer.delFromPattern(`sessions:${whatsappId}:*`);

    io.of(String(companyId))
      .emit(`admin-whatsapp`, {
        action: "delete",
        whatsappId: +whatsappId
      });
  }

  return res.status(200).json({ message: "Session disconnected." });
};

export const showAdmin = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const whatsapp = await ShowWhatsAppServiceAdmin(whatsappId);

  return res.status(200).json(whatsapp);
};

// Webhook handler para receber mensagens da API oficial do WhatsApp
export const webhook = async (req: Request, res: Response): Promise<Response> => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Verificação do webhook (GET request)
  if (req.method === "GET") {
    if (
      mode === "subscribe" &&
      token === process.env.WEBHOOK_VERIFY_TOKEN
    ) {
      console.log("Webhook verificado");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }

  // Processamento de mensagens (POST request)
  if (req.method === "POST") {
    const webhookData = req.body;

    try {
      // O webhook contém phone_number_id que podemos usar para encontrar o WhatsApp
      // e assim obter o companyId
      if (webhookData.entry && webhookData.entry.length > 0) {
        for (const entry of webhookData.entry) {
          if (entry.changes && entry.changes.length > 0) {
            for (const change of entry.changes) {
              const phoneNumberId = change.value?.metadata?.phone_number_id;
              
              if (phoneNumberId) {
                // Encontra o WhatsApp pelo phoneNumberId
                const whatsapp = await Whatsapp.findOne({
                  where: {
                    // @ts-ignore
                    phoneNumberId: phoneNumberId
                  }
                });

                if (whatsapp) {
                  await processWhatsAppCloudWebhook(webhookData, whatsapp.companyId);
                } else {
                  console.warn(`WhatsApp não encontrado para phoneNumberId: ${phoneNumberId}`);
                }
              }
            }
          }
        }
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
      return res.status(500).json({ error: "Erro ao processar webhook" });
    }
  }

  return res.sendStatus(405);
};

