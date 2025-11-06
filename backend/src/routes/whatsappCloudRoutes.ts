import express from "express";
import isAuth from "../middleware/isAuth";

import * as WhatsAppCloudController from "../controllers/WhatsAppCloudController";

import multer from "multer";
import uploadConfig from "../config/upload";
import { mediaUpload } from "../services/WhatsappService/uploadMediaAttachment";
import { deleteMedia } from "../services/WhatsappService/uploadMediaAttachment";

const upload = multer(uploadConfig);

const whatsappCloudRoutes = express.Router();

// Rotas principais
whatsappCloudRoutes.get("/whatsapp-cloud/", isAuth, WhatsAppCloudController.index);
whatsappCloudRoutes.get("/whatsapp-cloud/filter", isAuth, WhatsAppCloudController.indexFilter);
whatsappCloudRoutes.get("/whatsapp-cloud/all", isAuth, WhatsAppCloudController.listAll);

whatsappCloudRoutes.post("/whatsapp-cloud/", isAuth, WhatsAppCloudController.store);
whatsappCloudRoutes.get("/whatsapp-cloud/:whatsappId", isAuth, WhatsAppCloudController.show);
whatsappCloudRoutes.put("/whatsapp-cloud/:whatsappId", isAuth, WhatsAppCloudController.update);
whatsappCloudRoutes.delete("/whatsapp-cloud/:whatsappId", isAuth, WhatsAppCloudController.remove);
whatsappCloudRoutes.post("/closedimported-cloud/:whatsappId", isAuth, WhatsAppCloudController.closedTickets);

// Restart
whatsappCloudRoutes.post("/whatsapp-cloud-restart/", isAuth, WhatsAppCloudController.restart);

// Upload de mídia
whatsappCloudRoutes.post("/whatsapp-cloud/:whatsappId/media-upload", isAuth, upload.array("file"), mediaUpload);
whatsappCloudRoutes.delete("/whatsapp-cloud/:whatsappId/media-upload", isAuth, deleteMedia);

// Rotas admin
whatsappCloudRoutes.delete("/whatsapp-cloud-admin/:whatsappId", isAuth, WhatsAppCloudController.removeAdmin);
whatsappCloudRoutes.put("/whatsapp-cloud-admin/:whatsappId", isAuth, WhatsAppCloudController.updateAdmin);
whatsappCloudRoutes.get("/whatsapp-cloud-admin/:whatsappId", isAuth, WhatsAppCloudController.showAdmin);

// Webhook para receber mensagens da API oficial do WhatsApp
// Esta rota NÃO deve ter autenticação isAuth, pois será chamada pelo WhatsApp
whatsappCloudRoutes.get("/whatsapp-cloud-webhook", WhatsAppCloudController.webhook);
whatsappCloudRoutes.post("/whatsapp-cloud-webhook", WhatsAppCloudController.webhook);

export default whatsappCloudRoutes;


