import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Contact from "../../models/Contact";
import axios from "axios";
import Whatsapp from "../../models/Whatsapp";

const GetProfilePicUrl = async (
  number: string,
  companyId: number,
  contact?: Contact,
): Promise<string> => {
  try {
    const defaultWhatsapp = await GetDefaultWhatsApp(companyId);
    const phoneNumberId = (defaultWhatsapp as any).phoneNumberId;
    
    if (!defaultWhatsapp || !defaultWhatsapp.token || !phoneNumberId) {
      return `${process.env.FRONTEND_URL}/nopicture.png`;
    }

    // A API oficial do WhatsApp não fornece endpoint direto para foto de perfil
    // Você precisaria usar a API de perfil do WhatsApp Business
    // Por enquanto, retornamos a imagem padrão
    
    // TODO: Implementar busca de foto de perfil via API oficial quando disponível
    return `${process.env.FRONTEND_URL}/nopicture.png`;
  } catch (error) {
    return `${process.env.FRONTEND_URL}/nopicture.png`;
  }
};

export default GetProfilePicUrl;

