import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import axios from "axios";
import Whatsapp from "../../models/Whatsapp";

const CheckIsValidContact = async (number: string, companyId: number): Promise<void> => {
  try {
    const defaultWhatsapp = await GetDefaultWhatsApp(null, companyId);
    const phoneNumberId = (defaultWhatsapp as any).phoneNumberId;

    if (!defaultWhatsapp || !defaultWhatsapp.token || !phoneNumberId) {
      throw new AppError("ERR_WAPP_NOT_INITIALIZED");
    }

    // A API oficial do WhatsApp não tem um endpoint direto para verificar números
    // Uma alternativa seria tentar enviar uma mensagem de teste ou usar validação de formato
    const formattedNumber = number.replace(/\D/g, "");

    if (!formattedNumber || formattedNumber.length < 10) {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }

    // TODO: Implementar verificação real via API oficial quando disponível
    // Por enquanto, apenas valida o formato do número

  } catch (err: any) {
    console.log(err);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("ERR_WAPP_CHECK_CONTACT");
  }
};

export default CheckIsValidContact;

