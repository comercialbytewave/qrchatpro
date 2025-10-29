import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Category from "../../models/Category";

interface Request {
  name: string;
  code: string | null;
  companyId: number;
}

const CreateCategoryService = async ({
  name,
  code,
  companyId,  
}: Request): Promise<Category> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(3),
    code: Yup.string().optional().nullable().transform(value => (!value ? null : value))
  });

  try {
    await schema.validate({ name,code });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  
  if (code) {
    const codeExists = await Category.findOne({ where: { code, companyId } });

    if (codeExists) {
      throw new AppError("ERR_CATEGORY_CONFLICT_CODE", 409);
    }
  }

  const [category] = await Category.findOrCreate({
    where: { name, companyId },
    defaults: { name,code, companyId }
  });

  await category.reload();

  return category;
};

export default CreateCategoryService;
