import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Store from "../../models/Stores";

interface Request {
  document: string;
  name: string;
  fantasy: string;
  zipCode: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  isActive: boolean;
  latitude: string;
  longitude: string;
  companyId: number;
}

const CreateStoreService = async ({
  document,
  name,
  fantasy,
  zipCode,
  address,
  number,
  complement,
  neighborhood,
  city,
  state,
  latitude,
  longitude,
  isActive,
  companyId
}: Request): Promise<Store> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(3)
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }
  const storeExists = await Store.findOne({ where: { document } });
  if(storeExists){
    throw new AppError("CNPJ ja cadastrado");
  }

  const [store] = await Store.findOrCreate({
    where: { name, companyId },
    defaults: {
      document,
      name,
      fantasy,
      zipCode,
      address,
      number,
      complement,
      neighborhood,
      city,
      state,
      latitude,
      longitude,
      isActive,
      companyId
    }
  });

  await store.reload();

  return store;
};

export default CreateStoreService;
