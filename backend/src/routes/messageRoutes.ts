import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";

import * as MessageController from "../controllers/MessageController";
import * as TranscribeAudioController from "../controllers/TranscribeAudioController";

const messageRoutes = Router();

const upload = multer(uploadConfig);

messageRoutes.get("/messages/:ticketId", isAuth, MessageController.index);
messageRoutes.post("/messages/:ticketId", isAuth, upload.array("medias"), MessageController.store);
// messageRoutes.post("/forwardmessage",isAuth,MessageController.forwardmessage);
messageRoutes.delete("/messages/:messageId", isAuth, MessageController.remove);
messageRoutes.post("/messages/edit/:messageId", isAuth, MessageController.edit);

messageRoutes.get("/messages-allMe", isAuth, MessageController.allMe);
messageRoutes.post('/message/forward', isAuth, MessageController.forwardMessage);

// Audio transcription route
messageRoutes.post("/messages/:messageId/transcribe", isAuth, TranscribeAudioController.transcribe);

export default messageRoutes;

