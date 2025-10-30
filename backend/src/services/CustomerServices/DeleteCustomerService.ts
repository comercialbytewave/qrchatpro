
import AppError from "../../errors/AppError";
import Customer from "../../models/Customer";

const DeleteCustomerService = async (id: string | number): Promise<void> => {
  const customer = await Customer.findOne({
    where: { id }
  });

  if (!customer) {
    throw new AppError("ERR_NO_CUSTOMER_FOUND", 404);
  }

  await customer.destroy();
};

export default DeleteCustomerService;
