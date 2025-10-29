import * as Yup from "yup";

import AppError from "../../errors/AppError";


import ProductStore from "../../models/ProductStore";
import ShowProductService from "../ProductServices/ShowProductService";
import ProductStoreShowService from "./ShowProductStoreService";

interface ProductStoreData {
  productId?: number;
  storeId?: number;
  stock?: number;
  costPrice?: number;
  sellingPrice?: number;
  promotionPrice?: number;
  companyId?: number;
}

interface Request {
  producStoreData: ProductStoreData;
  id: string | number;
}

const UpdateProductStoreService = async ({
  producStoreData,
  id
}: Request): Promise<ProductStore | undefined> => {
  const productStore = await ProductStoreShowService(id);

  const schema = Yup.object().shape({
    productId: Yup.number().required(),
    storeId: Yup.number().required(),
    companyId: Yup.number().required(),
    stock: Yup.number().required(),
    costPrice: Yup.number().required(),
    sellingPrice: Yup.number().required()
  });

  const {
    productId,
    storeId,
    companyId,
    stock,
    costPrice,
    sellingPrice
  } = producStoreData;

  try {
    await schema.validate({
      productId,
      storeId,
      companyId,
      stock,
      costPrice,
      sellingPrice
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await productStore.update(producStoreData);

  await productStore.reload();
  return productStore;
};

export default UpdateProductStoreService;
