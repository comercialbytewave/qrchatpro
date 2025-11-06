import { Router } from "express";
import isAuth from "../middleware/isAuth";

import WhatsAppCloudSessionController from "../controllers/WhatsAppCloudSessionController";

const whatsappCloudSessionRoutes = Router();

whatsappCloudSessionRoutes.post(
  "/whatsapp-cloud-session/:whatsappId",
  isAuth,
  WhatsAppCloudSessionController.store
);

whatsappCloudSessionRoutes.put(
  "/whatsapp-cloud-session/:whatsappId",
  isAuth,
  WhatsAppCloudSessionController.update
);

whatsappCloudSessionRoutes.delete(
  "/whatsapp-cloud-session/:whatsappId",
  isAuth,
  WhatsAppCloudSessionController.remove
);

export default whatsappCloudSessionRoutes;


