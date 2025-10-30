import AppError from "../../errors/AppError";
import CustomerAddress from "../../models/CustomerAddress";

const ShowCustomerAddressService = async (customerId: string | number): Promise<CustomerAddress[]> => {
  const customerAddress = await CustomerAddress.findAll({
    where: {
      customerId: customerId
    }
  });

  return customerAddress;
};

export default ShowCustomerAddressService;
