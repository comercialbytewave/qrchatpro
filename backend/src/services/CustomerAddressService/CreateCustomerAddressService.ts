import * as Yup from "yup";

import AppError from "../../errors/AppError";
import CustomerAddress from "../../models/CustomerAddress";

interface Request {
  customerId: number | string;
  isActive: boolean;
  name: string;
  zipCode: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  companyId: number;
}



const CreateCustomerAddressService = async ({
  customerId,
  name,
  isActive,
  zipCode,
  address,
  number,
  neighborhood,
  city,
  state,
  companyId
}: Request): Promise<CustomerAddress> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(3)
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (zipCode) {
    const customerAddressExists = await CustomerAddress.findOne({
      where: {
        customerId,
        zipCode,
        companyId
      }
    });

    if (customerAddressExists) {
      throw new AppError("ERR_CUSTOMER_CONFLICT_CODE", 409);
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
  }

  const [customerAddress] = await CustomerAddress.findOrCreate({
    where: {
      customerId,
      isActive,
      name,
      zipCode,
      address,
      number,
      neighborhood,
      city,
      state,
      companyId
    },
    defaults: {
      customerId,
      isActive,
      name,
      zipCode,
      address,
      number,
      neighborhood,
      city,
      state,
      companyId
    }
  });

  await customerAddress.reload();

  return customerAddress;
};

export default CreateCustomerAddressService;
