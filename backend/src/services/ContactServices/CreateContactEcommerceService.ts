import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import { encrypt } from "../../utils/encrypt";

interface IContactCreate {
  name: string;
  number: string;
  email: string;
  document: string;
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
  addresses: [];
}
const CreateContactEcommerceService = async ({
  name,
  number,
  email,
  document,
  companyId
}: IContactCreate): Promise<IContactEcommerce> => {
  const contactExists = await Contact.findOne({
    where: { number, companyId }
  });

  if (contactExists) {
    throw new AppError("Contato já cadastrado.");
  }

  const contact = await Contact.create(
    {
      name,
      number,
      email,
      extraInfo: [
        {
          name: "CPF",
          value: document
        },
        {
          name: "NOME",
          value: name
        }
      ],
      companyId
    },
    {
      include: ["extraInfo"]
    }
  );

  const { extraInfo, ...data } = contact.toJSON() as any;

  const result: IContactEcommerce = {
    ...data,
    document: document,
    fullName: name,
    idCrypto: encrypt(String(data.id))
  };

  return result;
};

export default CreateContactEcommerceService;
