// services/ShowCustomerService.ts

import AppError from "../../errors/AppError";
import Customer from "../../models/Customer";
import Contact from "../../models/Contact";

interface Request {
  id: string | number;
  companyId: string | number;
}

const ShowCustomerService = async ({ id, companyId }: Request): Promise<Customer> => {
  const customer = await Customer.findOne({
    where: { id, companyId },
    include: [{ model: Contact }]
  });

  if (!customer) {
    throw new AppError("ERR_NO_CUSTOMER_FOUND", 404);
  }

  return customer;
};

export default ShowCustomerService;
