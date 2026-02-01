import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import logger from "../../utils/logger";

interface TranscriptionOptions {
    model?: string;
    responseFormat?: string;
    language?: string;
}

class AudioTranscriptionService {
    private apiUrl: string;
    private apiKey: string;

    constructor() {
        this.apiUrl = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/audio/transcriptions";
        this.apiKey = process.env.GROQ_API_KEY || "";
    }

    async transcribeAudio(
        filePath: string,
        options: TranscriptionOptions = {}
    ): Promise<string> {
        try {
            // Validate API key
            if (!this.apiKey) {
                throw new Error("GROQ_API_KEY não está configurada no ambiente");
            }

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                throw new Error(`Arquivo não encontrado: ${filePath}`);
            }

            // Check file size (max 25MB for free plan)
            const fileSize = fs.statSync(filePath).size;
            if (fileSize > 25 * 1024 * 1024) {
                throw new Error("Arquivo excede o limite de 25 MB");
            }

            // Validate file extension
            const validExtensions = [
                ".mp3",
                ".ogg",
                ".mp4",
                ".mpeg",
                ".mpga",
                ".m4a",
                ".wav",
                ".webm",
                ".flac"
            ];
            const ext = path.extname(filePath).toLowerCase();
            if (!validExtensions.includes(ext)) {
                throw new Error(`Formato de arquivo não suportado: ${ext}`);
            }

            // Prepare form data
            const form = new FormData();
            form.append("file", fs.createReadStream(filePath));
            form.append("model", options.model || "whisper-large-v3");
            form.append("response_format", options.responseFormat || "text");
            form.append("language", options.language || "pt");

            // Make API request
            const response = await axios.post(this.apiUrl, form, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    ...form.getHeaders()
                },
                timeout: 60000 // 60 seconds timeout
            });

            logger.info(`Audio transcription successful for file: ${filePath}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage =
                    error.response?.data?.error?.message ||
                    error.response?.data?.error ||
                    error.message;
                logger.error(`Groq API Error: ${JSON.stringify(errorMessage)}`);
                throw new Error(`Erro na API da GroqCloud: ${JSON.stringify(errorMessage)}`);
            }
            logger.error(`Transcription Error: ${error.message}`);
            throw new Error(`Erro ao transcrever áudio: ${error.message}`);
        }
    }
}

export default new AudioTranscriptionService();
