import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import axios from "axios";
import Whatsapp from "../../models/Whatsapp";

const CheckContactNumber = async (
  number: string, 
  companyId: number, 
  isGroup: boolean = false
): Promise<string> => {
  try {
    const whatsappList = await GetDefaultWhatsApp(null, companyId);
    const phoneNumberId = (whatsappList as any).phoneNumberId;

    if (!whatsappList || !whatsappList.token || !phoneNumberId) {
      throw new AppError("WhatsApp não configurado corretamente");
    }

    if (isGroup) {
      // Para grupos, a API oficial não tem verificação direta
      // Retorna o número formatado
      return number.replace(/\D/g, "");
    }

    // Verifica se o número está no WhatsApp usando a API oficial
    const verifyUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}`;
    
    // A API oficial não tem um endpoint direto para verificar números
    // Uma alternativa é tentar enviar uma mensagem de teste ou usar o endpoint de verificação de número
    // Por enquanto, apenas retornamos o número formatado
    
    // TODO: Implementar verificação de número via API oficial quando disponível
    const formattedNumber = number.replace(/\D/g, "");
    
    if (!formattedNumber || formattedNumber.length < 10) {
      throw new AppError("Número inválido");
    }

    return formattedNumber;
  } catch (err: any) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Erro ao verificar número: " + err.message);
  }
};

export default CheckContactNumber;

