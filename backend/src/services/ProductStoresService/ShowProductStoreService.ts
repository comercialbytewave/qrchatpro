import AppError from "../../errors/AppError";

import ProductStore from "../../models/ProductStore";

const ProductStoreShowService = async (id: string | number): Promise<ProductStore> => {
  const productStore = await ProductStore.findByPk(id);

  if (!productStore) {
    throw new AppError("ERR_NO_STORE_FOUND", 404);
  }

  return productStore;
};

export default ProductStoreShowService;
