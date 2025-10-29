import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Store from "../../models/Stores";
import ShowStoreService from "./ShowStoreService";

interface StoreData {
  id?: number;
  name?: string;
  fantasy?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  latitude?: string;
  longitude?: string;
  
}

interface Request {
  storeData: StoreData;
  id: string | number;
}

const UpdateStoreService = async ({
  storeData,
  id
}: Request): Promise<Store | undefined> => {
  const store = await ShowStoreService(id);

  const schema = Yup.object().shape({
    name: Yup.string().min(3)
  });

  const { name } = storeData;

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await store.update(storeData);

  await store.reload();
  return store;
};

export default UpdateStoreService;
