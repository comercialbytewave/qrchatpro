import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Category from "../../models/Category";
import Product from "../../models/Product";

interface Request {
  ean: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  categoryId: number;
  companyId: number;
}

const CreateProductService = async ({
  ean,
  name,
  code,
  description,
  isActive,
  categoryId,
  companyId
}: Request): Promise<Product> => {
  const schema = Yup.object().shape({
    code: Yup.string()
      .optional()
      .nullable()
      .transform(value => (!value ? null : value)),
    name: Yup.string().required().min(3)
  });

  try {
    await schema.validate({ name, code });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (code) {
    const codeExists = await Product.findOne({ where: { code, companyId } });

    if (codeExists) {
      throw new AppError("ERR_PRODUCT_CONFLICT_CODE", 409);
    }
  }

  const [product] = await Product.findOrCreate({
    where: { ean, code, name, description, isActive, categoryId, companyId },
    defaults: {  ean, code, name, description, isActive, categoryId, companyId }
  });

  await product.reload();

  return product;
};

export default CreateProductService;
