import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Category from "../../models/Category";

interface CategoryData {
  id?: number;
  name?: string;
  code?: string | null;
}

interface Request {
  categoryData: CategoryData;
  id: string | number;
  companyId: number;
}

const UpdateCategoryService = async ({
  categoryData,
  id,
  companyId
}: Request): Promise<Category | undefined> => {
  const category = await Category.findOne({ where: { id, companyId } });

  if (!category) {
    throw new AppError("ERR_NO_CATEGORY_FOUND", 404);
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(3),
    code: Yup.string().optional().nullable().transform(value => (!value ? null : value))
  });

  const { name, code } = categoryData;

  try {
    await schema.validate({ name, code });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (code && code !== category.code) {
    const codeExists = await Category.findOne({ where: { code, companyId } });

    if (codeExists) {
      throw new AppError("ERR_CATEGORY_CONFLICT_CODE", 409);
    }
  }

  await category.update({
    name,
    code
  });

  await category.reload();
  return category;
};

export default UpdateCategoryService;
