
import AppError from "../../errors/AppError";

import ProductStore from "../../models/ProductStore";

const DeleteProductStoreService = async (id: string | number): Promise<void> => {
  const productStore = await ProductStore.findOne({
    where: { id }
  });

  if (!productStore) {
    throw new AppError("ERR_NO_PRODUCT_STORE_FOUND", 404);
  }

  await productStore.destroy();
};

export default DeleteProductStoreService;
