import { Request, Response } from "express";
import path from "path";
import AppError from "../errors/AppError";
import Message from "../models/Message";
import AudioTranscriptionService from "../services/AudioTranscriptionService/AudioTranscriptionService";
import { getIO } from "../libs/socket";

export const transcribe = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { messageId } = req.params;
    const { companyId } = req.user;

    // Find the message
    const message = await Message.findOne({
        where: {
            id: messageId,
            companyId
        }
    });

    if (!message) {
        throw new AppError("Mensagem não encontrada", 404);
    }

    // Check if it's an audio message
    if (message.mediaType !== "audio") {
        throw new AppError("Esta mensagem não é um áudio", 400);
    }

    // Check if already transcribed (return cached)
    if (message.transcription) {
        return res.json({ transcription: message.transcription });
    }

    // Get the file path from mediaUrl
    // mediaUrl format: http://backend.url/public/company1/filename.ogg
    const mediaUrl = message.getDataValue("mediaUrl");
    if (!mediaUrl) {
        throw new AppError("Arquivo de áudio não encontrado", 404);
    }

    // Build the absolute file path
    const publicFolder = path.resolve(__dirname, "..", "..", "public");
    const filePath = path.join(publicFolder, `company${companyId}`, mediaUrl);

    try {
        // Call transcription service
        const transcription = await AudioTranscriptionService.transcribeAudio(filePath);

        // Update message with transcription
        await message.update({ transcription });

        // Emit socket event to update message in frontend
        const io = getIO();
        io.of(String(companyId)).emit(`company-${companyId}-appMessage`, {
            action: "update",
            message: await message.reload()
        });

        return res.json({ transcription });
    } catch (error) {
        throw new AppError(`Erro ao transcrever áudio: ${error.message}`, 500);
    }
};
