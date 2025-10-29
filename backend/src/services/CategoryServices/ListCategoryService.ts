import { Op, literal, fn, col } from "sequelize";
import Category from "../../models/Category";
interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  categories: Category[];
  count: number;
  hasMore: boolean;
}

const ListCategoryService = async ({
  companyId,
  searchParam,
  pageNumber = "1"
}: Request): Promise<Response> => {
  let whereCondition = {};

  whereCondition = searchParam
    ? { name: { [Op.iLike]: `%${searchParam}%` }, companyId }
    : { companyId };

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: categories } = await Category.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],
    subQuery: false,
    attributes: [
      "id",
      "name",
      "code"
    ],
    group: ["Category.id"]
  });

  const hasMore = count > offset + categories.length;

  return {
    categories,
    count,
    hasMore
    //    };
  };
};

export default ListCategoryService;
