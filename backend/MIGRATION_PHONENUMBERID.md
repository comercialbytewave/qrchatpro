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


