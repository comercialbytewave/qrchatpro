import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Customer from "../../models/Customer";
import Portifolio from "../../models/Portifolio";

interface Request {
  document: string;
  fullName: string;
  email: string;
  birthday?: Date;
  portifolioId: number | string;
  customerDefault?: boolean;
  companyId: number;
}

const CreateCustomerService = async ({
  document,
  fullName,
  email,
  birthday,
  portifolioId,
  customerDefault,
  companyId
}: Request): Promise<Customer> => {
  const schema = Yup.object().shape({
    fullName: Yup.string().required().min(3),
    document: Yup.number().required()
  });

  try {
    await schema.validate({ fullName, document });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (document) {
    const customerExists = await Customer.findOne({
      where: { document, companyId }
    });

    if (customerExists) {
      return customerExists;
    }
  }

  if (customerDefault) {
    const customerExists = await Customer.findOne({
      where: { customerDefault }
    });
    if (customerExists) {
      return customerExists;
    }
  }

  const [customer] = await Customer.findOrCreate({
    where: { document, fullName, email, birthday, portifolioId, customerDefault, companyId },
    defaults: { document, fullName, email, birthday, portifolioId, customerDefault, companyId }
  });

  
  await customer.reload({ include: [{ model: Portifolio, as: "portifolio" }] });

  return customer;
};

export default CreateCustomerService;
