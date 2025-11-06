<img src="https://imgur.com/a/ZqRDnPP" />

## 🚀 QRChat: O Futuro da Comunicação com Clientes

Experimente gratuitamente o QRChat, o sistema de tickets via WhatsApp que transforma seu atendimento e te coloca no controle total!

Com o QRChat, você não apenas gerencia; você automatiza e escala com as ferramentas mais poderosas do mercado:

1️⃣ - Automação de Elite: Integração nativa e poderosa com DialogFlow, n8n, Typebot, WebHooks, Facebook, Instagram e um Construtor de Fluxos visual e intuitivo para Chatbot.

2️⃣ - Recomendado por Especialistas: Desenvolvido por líderes em automação e atendimento, o QRChat é a escolha dos profissionais que priorizam a eficiência e a excelência.

3️⃣ - Foco Total no Cliente: Diga adeus ao caos de gerenciar múltiplos canais. Nosso sistema é projetado para simplificar sua rotina, permitindo que sua equipe se concentre no que realmente importa: oferecer uma experiência de atendimento 5 estrelas.

Pare de perder tempo com processos complexos. Descubra a agilidade, a integração e o poder do QRChat hoje mesmo.

<br /><br />

## 📌 Integrações

<img src="https://i.postimg.cc/CxJmZYZk/Group-26.png" />

<br /><br />

## 🔧 Requisitos

<img src="https://i.postimg.cc/kGRpDYJC/Group-27.png" style="height: 250px;" />

<nav>
  <ul>
    <li>Subdomínio para Frontend: https://qrchat.bytewave.com.br</li>
    <li>Subdomínio para API (Backend): https://qrchat.bytewave.com.br/api</li>
  </ul>
</nav>

<br /><br />

## 💿 Instalação

Esqueça as guias de instalação! Com o QRChat, você se cadastra e opera diretamente. Simples assim.

<br /><br />

## ⭐ Recursos

✨ Integração com o Pixel do Facebook: Acompanhe e registre conversões com o pixel do Facebook    
✨ Integração com Webhook: Utilize webhooks para conectar com outros sistemas e automatizar processos   
✨ Construtor De Fluxos Para Chatbot     
✨ Atendentes   
✨ Modo Claro/Escuro    
✨ Cores Personalizadas  
✨ Logotipo/Marca Própria  
✨ Aplicativo PWA  
✨ Domínio Próprio  
✨ Cores Personalizadas  
✨ Logotipo / Marca Própria  
✨ Aplicativo PWA  
✨ Dashboard  
✨ Estatísticas  
✨ Mensagens Agendadas com Anexo  
✨ Respostas Rápidas com Anexo  
✨ Agendamento Recorrente  
✨ Campanhas Recorrentes  
✨ Carteira de Cliente  
✨ Gerenciamento de Grupos  
✨ Chat Interno  
✨ Tarefas  
✨ Campanhas  
✨ Áudio Gravado na Hora  
✨ Setores & Filas  
✨ Recuperação de Senha por E-Mail

<br /><br />

## ✅ Recursos via API

🟢 Atualizar Contatos  
🟢 Atualizar Tickets  
🟢 Criar Agendamento  
🟢 Criar Contatos  
🟢 Criar Empresas  
🟢 Criar Tags  
🟢 Enviar Mensagens  
🟢 Excluir Agendamento  
🟢 Excluir Contatos  
🟢 Excluir Tags  
🟢 Listar Agendamento  
🟢 Listar Contatos  
🟢 Listar Tags

<br /><br />

## ⚠️ Isenção de Responsabilidade

Este projeto não é afiliado, associado, autorizado, endossado ou de qualquer forma oficialmente conectado ao WhatsApp ou a qualquer uma de suas subsidiárias ou afiliadas. O site oficial do WhatsApp pode ser encontrado em https://whatsapp.com. “WhatsApp”, bem como nomes, marcas, emblemas e imagens relacionados são marcas registradas de seus respectivos proprietários.

<br /><br />

## 📍 Github

Codigo baseado no Whaticket Community de:
<nav>
  <ul>
    <li><a href="https://github.com/canove/whaticket-community" target="_blank">Cassio Santos no GitHub</a></li>

<br /><br />

## 🛠️ Com as seguintes Ferramentas de Apoio:
<nav>
    <li><a href="https://github.com/WhiskeySockets/Baileys" target="_blank">Baileys - WhatsApp Web API</a></li>
    <li><a href="https://github.com/redis/redis" target="_blank">Redis</a></li>
    <li><a href="https://github.com/postgres/postgres" target="_blank">PostgreSQL</a></li>
    <li><a href="https://github.com/docker" target="_blank">Docker</a></li>
    <li><a href="https://github.com/nginx/nginx" target="_blank">Nginx</a></li>
    <li><a href="https://github.com/nodejs/node" target="_blank">Node</a></li>
    <li><a href="https://github.com/Unitech/pm2" target="_blank">PM2</a></li>
    <li><a href="https://github.com/certbot/certbot" target="_blank">Certbot</a></li>
  </ul>
</nav>

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




# Implementação do Campo phoneNumberId para WhatsApp Cloud API

## Alterações Realizadas

### 1. Modelo Whatsapp (`backend/src/models/Whatsapp.ts`)
- ✅ Adicionado campo `phoneNumberId` do tipo `TEXT` e `AllowNull(true)`
- Campo posicionado após `token` para manter organização lógica

### 2. Migration (`backend/src/database/migrations/20251106152140-add-phoneNumberId-to-whatsapps.ts`)
- ✅ Criada migration para adicionar coluna `phoneNumberId` na tabela `Whatsapps`
- Tipo: `TEXT`
- Permite `NULL` (para compatibilidade com WhatsApps existentes)
- Inclui método `down` para rollback

### 3. Services Atualizados

#### CreateWhatsAppService (`backend/src/services/WhatsappService/CreateWhatsAppService.ts`)
- ✅ Adicionado `phoneNumberId` na interface `Request`
- ✅ Adicionado parâmetro na função
- ✅ Incluído no `Whatsapp.create()`

#### UpdateWhatsAppService (`backend/src/services/WhatsappService/UpdateWhatsAppService.ts`)
- ✅ Adicionado `phoneNumberId` na interface `WhatsappData`
- ✅ Adicionado na desestruturação
- ✅ Incluído no `whatsapp.update()`

#### UpdateWhatsAppServiceAdmin (`backend/src/services/WhatsappService/UpdateWhatsAppServiceAdmin.ts`)
- ✅ Adicionado `phoneNumberId` na interface `WhatsappData`
- ✅ Adicionado na desestruturação
- ✅ Incluído no `whatsapp.update()`

### 4. Controllers Atualizados

#### WhatsAppCloudController (`backend/src/controllers/WhatsAppCloudController.ts`)
- ✅ Removido código redundante de update manual
- ✅ Agora usa os services corretamente que já incluem `phoneNumberId`

## Como Executar a Migration

Para aplicar a migration no banco de dados:

```bash
cd backend
npm run db:migrate
```

Ou usando o Sequelize CLI diretamente:

```bash
cd backend
npx sequelize db:migrate
```

## Estrutura do Campo

```typescript
@AllowNull(true)
@Column(DataType.TEXT)
phoneNumberId: string;
```

- **Tipo**: TEXT (permite strings longas)
- **Nullable**: Sim (para compatibilidade com WhatsApps existentes)
- **Default**: null

## Verificação

Após executar a migration, você pode verificar se a coluna foi criada:

```sql
-- PostgreSQL
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Whatsapps' AND column_name = 'phoneNumberId';

-- MySQL
DESCRIBE Whatsapps;
```

## Notas Importantes

1. O campo é opcional e permite `NULL` para manter compatibilidade com WhatsApps existentes
2. Apenas WhatsApps Cloud API terão este campo preenchido
3. A migration pode ser revertida usando `npm run db:migrate:undo`


<br /><br />

## 🙋 Suporte e Contato

Entre em contato através do <a href="https://wa.me/5585992795219" target="_blank">Whatsapp</a> ou <a href="mailto:comercialbytewave@gmail.com" target="_blank">E-mail</a>.