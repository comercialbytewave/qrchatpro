import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Customer from "../../models/Customer";
import { encrypt } from "../../utils/encrypt";
interface Request {
  document: string;
  number: string;
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
  idCustomer?: number;
  addresses: [];
}

const ShowByDocumentAndPhoneContactService = async ({
  document,
  number,
  companyId
}: Request): Promise<IContactEcommerce> => {

  let customers = await Customer.findOne({
    where: { document, companyId }
  })

  if (!customers) {
    throw new AppError("Cliente não cadastrado");
  }

  let contact = await Contact.findOne({
    where: { number: "55" + number, companyId },
    include: ["extraInfo"]
  });

  if (!contact) {
    contact = await Contact.create({
      name: customers.fullName,
      number: "55" + number,
      email: customers.email,
      channel: "ecommerce",
      isGroup: false,
      customerId: customers.id,
      companyId,
    })
  }

  if(!contact.customerId) {
    await Contact.update({
      customerId: customers.id,
      
    }, {
      where: { id: contact.id, companyId }
    })
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

export default ShowByDocumentAndPhoneContactService;
