
import AppError from "../../errors/AppError";
import CustomerAddress from "../../models/CustomerAddress";


const DeleteCustomerAddressService = async (id: string | number): Promise<void> => {
  const customerAddress = await CustomerAddress.findOne({
    where: { id }
  });

  if (!customerAddress) {
    throw new AppError("ERR_NO_CUSTOMER_ADDRESS_FOUND", 404);
  }

  await customerAddress.destroy();
};

export default DeleteCustomerAddressService;
