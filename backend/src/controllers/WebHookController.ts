import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import { handleMessage } from "../services/FacebookServices/facebookMessageListener";
import logger from "../utils/logger";
// import { handleMessage } from "../services/FacebookServices/facebookMessageListener";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "whaticket";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  logger.info(`[WEBHOOK] Verification request - mode: ${mode}, token: ${token}`);

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      logger.info(`[WEBHOOK] Verification SUCCESS`);
      return res.status(200).send(challenge);
    }
  }

  logger.warn(`[WEBHOOK] Verification FAILED`);
  return res.status(403).json({
    message: "Forbidden"
  });
};

export const webHook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { body } = req;

    logger.info(`[WEBHOOK] Received event - object: ${body.object}`);
    logger.info(`[WEBHOOK] Full body: ${JSON.stringify(body, null, 2)}`);

    if (body.object === "page" || body.object === "instagram") {
      let channel: string;

      if (body.object === "page") {
        channel = "facebook";
      } else {
        channel = "instagram";
      }

      logger.info(`[WEBHOOK] Channel: ${channel}, entries: ${body.entry?.length || 0}`);

      body.entry?.forEach(async (entry: any) => {
        logger.info(`[WEBHOOK] Processing entry ID: ${entry.id}`);

        const getTokenPage = await Whatsapp.findOne({
          where: {
            facebookPageUserId: entry.id,
            channel
          }
        });

        if (getTokenPage) {
          logger.info(`[WEBHOOK] Found connection for page ${entry.id}, company ${getTokenPage.companyId}`);
          entry.messaging?.forEach((data: any) => {
            logger.info(`[WEBHOOK] Processing message: ${JSON.stringify(data)}`);
            handleMessage(getTokenPage, data, channel, getTokenPage.companyId);
          });
        } else {
          logger.warn(`[WEBHOOK] No connection found for page ID: ${entry.id}, channel: ${channel}`);
        }
      });

      return res.status(200).json({
        message: "EVENT_RECEIVED"
      });
    }

    logger.warn(`[WEBHOOK] Unknown object type: ${body.object}`);
    return res.status(404).json({
      message: body
    });
  } catch (error) {
    logger.error(`[WEBHOOK] Error: ${error}`);
    return res.status(500).json({
      message: error
    });
  }
};