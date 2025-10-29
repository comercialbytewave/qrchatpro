import AppError from "../../errors/AppError";
import Category from "../../models/Category";

interface Request {
  id: string | number
  companyId: number
}

const ShowCategoryService = async ({id, companyId}: Request): Promise<Category> => {
  const category = await Category.findOne({where: {id, companyId}});

  if (!category) {
    throw new AppError("ERR_NO_CATEGORY_FOUND", 404);
  }

  return category;
};

export default ShowCategoryService;
