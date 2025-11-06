# Controllers e Rotas WhatsApp Cloud API

## Arquivos Criados

### Controllers

1. **WhatsAppCloudController.ts** (`backend/src/controllers/WhatsAppCloudController.ts`)
   - Controller principal para gerenciar WhatsApp Cloud API
   - Baseado em `WhatsAppController.ts` mas adaptado para API oficial
   - Inclui handler de webhook para receber mensagens

2. **WhatsAppCloudSessionController.ts** (`backend/src/controllers/WhatsAppCloudSessionController.ts`)
   - Controller para gerenciar sessões do WhatsApp Cloud
   - Baseado em `WhatsAppSessionController.ts`
   - Gerencia início, atualização e remoção de sessões

### Rotas

1. **whatsappCloudRoutes.ts** (`backend/src/routes/whatsappCloudRoutes.ts`)
   - Rotas principais do WhatsApp Cloud API
   - Inclui rotas para CRUD, restart, upload de mídia e webhook

2. **whatsappCloudSessionRoutes.ts** (`backend/src/routes/whatsappCloudSessionRoutes.ts`)
   - Rotas para gerenciamento de sessões

## Endpoints Disponíveis

### WhatsApp Cloud Principal

- `GET /whatsapp-cloud/` - Lista todos os WhatsApp Cloud da empresa
- `GET /whatsapp-cloud/filter` - Lista filtrada
- `GET /whatsapp-cloud/all` - Lista todos (admin)
- `POST /whatsapp-cloud/` - Cria novo WhatsApp Cloud
- `GET /whatsapp-cloud/:whatsappId` - Mostra detalhes
- `PUT /whatsapp-cloud/:whatsappId` - Atualiza configuração
- `DELETE /whatsapp-cloud/:whatsappId` - Remove WhatsApp Cloud
- `POST /whatsapp-cloud-restart/` - Reinicia todas as sessões
- `POST /whatsapp-cloud/:whatsappId/media-upload` - Upload de mídia
- `DELETE /whatsapp-cloud/:whatsappId/media-upload` - Remove mídia

### Sessões WhatsApp Cloud

- `POST /whatsapp-cloud-session/:whatsappId` - Inicia sessão
- `PUT /whatsapp-cloud-session/:whatsappId` - Atualiza sessão
- `DELETE /whatsapp-cloud-session/:whatsappId` - Remove sessão

### Webhook

- `GET /whatsapp-cloud-webhook` - Verificação do webhook (WhatsApp chama isso)
- `POST /whatsapp-cloud-webhook` - Recebe mensagens do WhatsApp

## Configuração do Webhook

Para configurar o webhook no painel do Facebook/Meta:

1. URL do Webhook: `https://seu-dominio.com/whatsapp-cloud-webhook`
2. Verify Token: Configure no `.env` como `WEBHOOK_VERIFY_TOKEN`
3. Campos para inscrever: `messages`, `message_status`

## Variáveis de Ambiente Necessárias

```env
WEBHOOK_VERIFY_TOKEN=seu_token_de_verificacao_aqui
```

## Diferenças em Relação aos Controllers Originais

1. **Não usa Baileys**: Não há necessidade de gerenciar WebSocket ou QR Code
2. **Requer phoneNumberId**: Campo obrigatório para identificar o número na API oficial
3. **Webhook Handler**: Inclui handler para receber mensagens via webhook HTTP
4. **Validação Específica**: Valida token e phoneNumberId antes de criar/atualizar

## Exemplo de Uso

### Criar WhatsApp Cloud

```json
POST /whatsapp-cloud/
{
  "name": "WhatsApp Cloud Principal",
  "token": "EAAxxxxxxxxxxxx",
  "phoneNumberId": "123456789012345",
  "companyId": 1,
  "queueIds": [1, 2],
  "isDefault": true,
  "greetingMessage": "Olá! Como posso ajudar?",
  "channel": "whatsapp-cloud"
}
```

### Iniciar Sessão

```
POST /whatsapp-cloud-session/1
```

### Webhook (configurado no Facebook)

O WhatsApp enviará requisições POST para:
```
POST /whatsapp-cloud-webhook
```

## Notas Importantes

- O campo `phoneNumberId` precisa ser adicionado ao modelo `Whatsapp` ou armazenado como campo customizado
- O webhook não requer autenticação `isAuth` pois é chamado pelo WhatsApp
- O token de verificação do webhook deve ser configurado no `.env`
- As rotas foram adicionadas ao arquivo `routes/index.ts`


