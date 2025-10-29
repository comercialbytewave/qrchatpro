import Store from "../../models/Stores";
import AppError from "../../errors/AppError";

const DeleteStoreService = async (id: string | number): Promise<void> => {
  const store = await Store.findOne({
    where: { id }
  });

  if (!store) {
    throw new AppError("ERR_NO_STORE_FOUND", 404);
  }

  await store.destroy();
};

export default DeleteStoreService;
