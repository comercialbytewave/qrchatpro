import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Category from "../../models/Category";
import Customer from "../../models/Customer";
import CustomerAddress from "../../models/CustomerAddress";

interface CustomerAddressData {
  id?: number;
  isActive?: boolean;
  customerId?: number | string;
  name?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  companyId?: number;
}

interface Request {
  customerAddressData: CustomerAddressData;
  id: string | number;
  companyId: number;
}

const UpdateCustomerAddressService = async ({
  customerAddressData,
  id,
  companyId
}: Request): Promise<CustomerAddress | undefined> => {
  const customerAddress = await CustomerAddress.findOne({ where: { id, companyId } });

  if (!customerAddress) {
    throw new AppError("ERR_NO_CUSTOMER_ADDRESS_FOUND", 404);
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(3)
  });

  const { name, isActive, zipCode, customerId, } = customerAddressData;

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (zipCode && zipCode !== customerAddress.zipCode) {
    const customerAddressExists = await CustomerAddress.findOne({ where: { zipCode, customerId, companyId } });

    if (customerAddressExists) {
      throw new AppError("ERR_CUSTOMER_ADDRESS_CONFLICT_CODE", 409);
    }
  }

  const customerAddressActiveExists = await CustomerAddress.findOne({
    where: {
      customerId,
      isActive,
      companyId
    }
  });

  if (customerAddressActiveExists && isActive) {
    customerAddressActiveExists.isActive = false;
    await CustomerAddress.update({
      isActive: false
    }, {
      where: {
        id: customerAddressActiveExists.id
      }
    });      
  }

  await customerAddress.update(customerAddressData);

  await customerAddress.reload();
  return customerAddress;
};

export default UpdateCustomerAddressService;
