import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Category from "../../models/Category";
import Customer from "../../models/Customer";
import Portifolio from "../../models/Portifolio";

interface CustomerData {
  id?: number;
  document?: string;
  fullName?: string;
  birthday?: Date;
  portifolioId?: number | string;
  email?: string | null;
  customerDefault?: boolean;
}

interface Request {
  customerData: CustomerData;
  id: string | number;
  companyId: number;
}

const UpdateCustomerService = async ({
  customerData,
  id,
  companyId
}: Request): Promise<Customer | undefined> => {
  const customer = await Customer.findOne({ where: { id, companyId } });

  if (!customer) {
    throw new AppError("ERR_NO_CUSTOMER_FOUND", 404);
  }

  const schema = Yup.object().shape({
    fullName: Yup.string().min(3),
    document: Yup.string().required()
  });

  const { fullName, document, email, birthday, portifolioId, customerDefault } =
    customerData;

  try {
    await schema.validate({ fullName, document });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (document && document !== customer.document) {
    const customerExists = await Customer.findOne({
      where: { document, companyId }
    });

    if (customerExists) {
      throw new AppError("ERR_CUSTOMER_CONFLICT_CODE", 409);
    }

    if (customerDefault) {
      const customerExists = await Customer.findOne({
        where: { customerDefault }
      });
      if (customerExists  && id !== customer.id) {
        throw new AppError("ERR_CUSTOMER_CONFLICT_CODE", 409);
      }
    }
  }

  await customer.update({
    document,
    fullName,
    email,
    portifolioId,
    birthday,
    customerDefault
  });

  await customer.reload({ include: [{ model: Portifolio, as: "portifolio" }] });
  return customer;
};

export default UpdateCustomerService;
