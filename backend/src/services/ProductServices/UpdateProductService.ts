import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Product from "../../models/Product";
import Category from "../../models/Category";

interface ProductData {
  id?: number;
  ean?: string;
  code?: string | null;
  name?: string;
  description?: string;
  isActive?: boolean;
  categoryId?: number;
}

interface Request {
  productData: ProductData;
  id: string | number;
  companyId: number;
}

const UpdateProductService = async ({
  productData,
  id,
  companyId
}: Request): Promise<Product | undefined> => {
  const product = await Product.findOne({ where: { id, companyId } });

  if (!product) {
    throw new AppError("ERR_NO_PRODUCT_FOUND", 404);
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(3),
    code: Yup.string().optional().nullable().transform(value => (!value ? null : value))
  });

  const { ean, code, name, description, isActive, categoryId } = productData;

  try {
    await schema.validate({ name, code });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (code && code !== product.code) {
    const codeExists = await Product.findOne({ where: { code, companyId } });
    if (codeExists) {
      throw new AppError("ERR_PRODUCT_CONFLICT_CODE", 409);
    }
  }

  await product.update({
    ean,
    code,
    name,
    description,
    isActive,
    categoryId
  });

  // corrigido alias: deve ser o mesmo definido em Product.belongsTo(Category)
  await product.reload({ include: [{ model: Category, as: "category" }] });

  return product;
};

export default UpdateProductService;
