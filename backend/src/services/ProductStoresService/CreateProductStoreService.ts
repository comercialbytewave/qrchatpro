import * as Yup from "yup";

import AppError from "../../errors/AppError";

import ProductStore from "../../models/ProductStore";

interface Request {
  productId: number;
  storeId: number;
  stock: number;
  costPrice: number;
  sellingPrice: number;
  promotionPrice: number;
  companyId: number;
}

const CreateProductStoreService = async ({
  productId,
  storeId,
  stock,
  costPrice,
  sellingPrice,
  promotionPrice,
  companyId
}: Request): Promise<ProductStore> => {
  const schema = Yup.object().shape({
    productId: Yup.number().required(),
    storeId: Yup.number().required(),
    companyId: Yup.number().required(),
    stock: Yup.number().required(),
    costPrice: Yup.number().required(),
    sellingPrice: Yup.number().required()
  });

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

  const existingRecord = await ProductStore.findOne({
    where: { productId, storeId, companyId }
  });

  if (existingRecord) {
    throw new AppError("Este produto já está cadastrado para esta loja e empresa.");
  }

  const [productStore] = await ProductStore.findOrCreate({
    where: { productId, storeId, companyId },
    defaults: {
      productId,
      storeId,
      stock,
      costPrice,
      sellingPrice,
      promotionPrice,
      companyId
    }
  });

  await productStore.reload();

  return productStore;
};

export default CreateProductStoreService;
