import { Op, Sequelize } from "sequelize";
import Category from "../../models/Category";

interface Request {
  companyId: number;
  searchParam?: string;
}

const SimpleListCategoryService = async ({
  companyId,
  searchParam,
}: Request): Promise<Category[]> => {
  let whereCondition = {};

  whereCondition = searchParam
    ? { name: { [Op.iLike]: `%${searchParam}%` }, companyId }
    : { companyId };

  const categories = await Category.findAll({
    where: { ...whereCondition, companyId  },
    order: [["name", "ASC"]]
  });

  return categories;
};

export default SimpleListCategoryService;
