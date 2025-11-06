# WhatsApp Cloud Services

Esta pasta contém serviços adaptados para usar a **API oficial do WhatsApp (WhatsApp Cloud API)** ao invés da biblioteca Baileys.

## Estrutura de Arquivos

### Arquivos Principais

- **StartWhatsAppCloudSession.ts**: Inicializa uma sessão usando a API oficial do WhatsApp. Não requer QR code, apenas token e phoneNumberId.

- **SendWhatsAppCloudMessage.ts**: Envia mensagens de texto usando a API oficial do WhatsApp.

- **SendWhatsAppCloudMedia.ts**: Envia mídias (imagens, vídeos, áudios, documentos) usando a API oficial.

- **whatsAppCloudMessageProcessor.ts**: Processador principal de mensagens recebidas via webhooks da API oficial do WhatsApp. Contém todas as funções para processar mensagens, mídias, contatos, tickets, filas e chatbot.

- **whatsAppCloudMessageListener.ts**: Arquivo legado mantido para compatibilidade. O processamento principal está em `whatsAppCloudMessageProcessor.ts`.

- **whatsAppCloudMonitor.ts**: Monitora o status da conexão e verifica periodicamente a validade do token.

### Arquivos Auxiliares

- **CheckNumber.ts**: Verifica se um número é válido (adaptado para API oficial).

- **CheckIsValidContact.ts**: Verifica se um contato é válido.

- **GetProfilePicUrl.ts**: Obtém URL da foto de perfil (TODO: implementar quando disponível na API).

- **DeleteWhatsAppCloudMessage.ts**: Deleta mensagens usando a API oficial.

- **MarkDeleteWhatsAppCloudMessage.ts**: Marca mensagens como deletadas quando recebidas via webhook.

- **SendWhatsAppCloudMessageAPI.ts**: Versão simplificada para uso via API externa.

- **StartAllWhatsAppCloudSessions.ts**: Inicia todas as sessões WhatsApp Cloud de uma empresa.

## Diferenças Principais em Relação ao WbotServices

1. **Não usa WebSocket**: A API oficial usa webhooks HTTP para receber mensagens e requisições HTTP para enviar.

2. **Não precisa de QR Code**: A autenticação é feita via token de acesso permanente.

3. **Requere Configuração Adicional**: 
   - `token`: Token de acesso da API do WhatsApp
   - `phoneNumberId`: ID do número de telefone na API do WhatsApp

4. **Webhooks**: É necessário configurar um endpoint para receber webhooks do WhatsApp.

## Como Usar

### 1. Configurar o WhatsApp no Banco de Dados

Certifique-se de que o registro do WhatsApp tenha:
- `token`: Token de acesso da API
- `phoneNumberId`: ID do número de telefone
- `channel`: "whatsapp" ou "whatsapp-cloud"

### 2. Configurar Webhook

Você precisará criar um controller para receber os webhooks do WhatsApp. Exemplo:

```typescript
import { processWhatsAppCloudWebhook } from "../services/WhatsAppCloudServices/whatsAppCloudMessageProcessor";

export const webhook = async (req: Request, res: Response) => {
  // Verificação do webhook (GET)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    
    if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  // Processamento de mensagens (POST)
  if (req.method === "POST") {
    const webhookData = req.body;
    await processWhatsAppCloudWebhook(webhookData, companyId);
    return res.sendStatus(200);
  }
};
```

### 3. Iniciar Sessão

```typescript
import { StartWhatsAppCloudSession } from "./services/WhatsAppCloudServices/StartWhatsAppCloudSession";

await StartWhatsAppCloudSession(whatsapp, companyId);
```

## Notas Importantes

- A API oficial do WhatsApp tem limites de taxa (rate limits).
- Algumas funcionalidades podem não estar disponíveis na API oficial (ex: foto de perfil).
- Os webhooks devem ser configurados no painel do Facebook/Meta.
- O token pode expirar e precisar ser renovado.

## Próximos Passos

1. Criar controller para webhooks
2. Implementar renovação automática de tokens
3. Adicionar tratamento de erros específicos da API oficial
4. Implementar funcionalidades adicionais conforme necessário


