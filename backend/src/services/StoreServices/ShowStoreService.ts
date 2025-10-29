import AppError from "../../errors/AppError";
import Store from "../../models/Stores";

const ShowStoreService = async (id: string | number): Promise<Store> => {
  const store = await Store.findByPk(id);

  if (!store) {
    throw new AppError("ERR_NO_STORE_FOUND", 404);
  }

  return store;
};

export default ShowStoreService;
