import AppError from "../../errors/AppError";
import CustomerAddress from "../../models/CustomerAddress";

const CustomerAddressShowService = async (id: string | number): Promise<CustomerAddress> => {
  const customerAddress = await CustomerAddress.findByPk(id);

  if (!customerAddress) {
    throw new AppError("ERR_NO_CUSTOMER_ADDRESS_FOUND", 404);
  }

  return customerAddress;
};

export default CustomerAddressShowService;
