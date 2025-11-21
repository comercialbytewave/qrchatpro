import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Customer from "../../models/Customer";
import { decrypt, encrypt } from "../../utils/encrypt";

interface Request {
  id: string;
  companyId: number;
}

interface IContactEcommerce {
  id: number;
  name: string;
  number: string;
  email: string;
  profilePicUrl: string;
  channel: string;
  isGroup: boolean;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  document: string | null;
  fullName: string | null;
  idCrypto?: string;
  customerId?: number;
  addresses: [];
}

const ShowByIdCryptoContactService = async ({
  id,
  companyId
}: Request): Promise<IContactEcommerce> => {
  if (process.env.NODE_ENV === "developer") {
    console.log(encrypt(id));
  }

  let idDecrypt;

  try {
    idDecrypt = decrypt(id);
  } catch (error) {
    throw new AppError("Erro ao descriptografar");
  }

  if (!idDecrypt) {
    throw new AppError("Id inválido");
  }

  const contact = await Contact.findOne({
    where: { id: idDecrypt, companyId },
    include: ["extraInfo"]
  });

  if (!contact.customerId) {
    throw new AppError("Cliente não cadastrado");
  }

 
  let customers = await Customer.findOne({
    where: { id: contact.customerId, companyId }
  })

  if (!customers) {
    throw new AppError("Cliente não cadastrado");
  }
  
  const { customer, ...data } = contact.toJSON() as any;

  const result: IContactEcommerce = {
    ...data,
    document: customers.document,
    fullName: customers.fullName,
    idCustomer: customers.id,
    idCrypto: encrypt(String(data.id))
  };

  return result;
};

export default ShowByIdCryptoContactService;
