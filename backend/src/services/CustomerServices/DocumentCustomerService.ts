// services/DocumentCustomerService.ts

import AppError from "../../errors/AppError";
import Customer from "../../models/Customer";
import Contact from "../../models/Contact";

interface Request {
  document: string | number;
  companyId: number;
}

const DocumentCustomerService = async ({ document, companyId }: Request): Promise<Customer> => {
  const customer = await Customer.findOne({
    where: { document, companyId },
    include: [{ model: Contact }]
  });

  if (!customer) {
    return new Customer({
      document,
      fullName: "",
      email: "",
      birthday: null,
      portifolioId: 0,
      customerDefault: false,
      companyId
    })
  }

  return customer;
};

export default DocumentCustomerService;
