import { Request, Response } from "express";
import Version from "../models/Versions";
import logger from "../utils/logger";

export const index = async (req: Request, res: Response): Promise<Response> => {
    try {
        let version = await Version.findByPk(1);

        // Se não existir, cria o registro
        if (!version) {
            version = await Version.create({
                id: 1,
                versionFrontend: "0.0.0",
                versionBackend: "0.0.0"
            });
        }

        return res.status(200).json({
            version: version.versionFrontend || "0.0.0"
        });
    } catch (error) {
        logger.error(`[VersionController.index] Error: ${error}`);
        return res.status(500).json({ error: "Failed to get version" });
    }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    try {
        let version = await Version.findByPk(1);

        // Se não existir, cria o registro
        if (!version) {
            version = await Version.create({
                id: 1,
                versionFrontend: req.body.version || "0.0.0",
                versionBackend: "0.0.0"
            });
        } else {
            version.versionFrontend = req.body.version;
            await version.save();
        }

        return res.status(200).json({
            version: version.versionFrontend
        });
    } catch (error) {
        logger.error(`[VersionController.store] Error: ${error}`);
        return res.status(500).json({ error: "Failed to save version" });
    }
};