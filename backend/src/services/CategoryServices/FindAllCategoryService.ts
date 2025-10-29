import Category from "../../models/Category";
import Plan from "../../models/Plan";

const FindAllCategoryService = async (companyId): Promise<Category[]> => {
  const categories = await Category.findAll({
    where: {
      companyId: companyId,
    },
    order: [["name", "ASC"]]
  });
  return categories;
};

export default FindAllCategoryService;
