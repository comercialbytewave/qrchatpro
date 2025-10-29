import { Op, literal, fn, col } from "sequelize";
import Category from "../../models/Category";
import Product from "../../models/Product";
interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  products: Product[];
  count: number;
  hasMore: boolean;
}

const ListProductService = async ({
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

  const { count, rows: products } = await Product.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],
    subQuery: false,
    attributes: [
      "id",
      "ean",
      "code",
      "name",
      "description",
      "isActive",
      "mediaPath",
      "mediaName",
      "categoryId"
    ],
    include: [
      {
        model: Category,
        as: "category", // deve ser igual ao alias na associação
        attributes: ["id", "name", "code"]
      }
    ],
    group: ["Product.id", "category.id"]
  });

  const hasMore = count > offset + products.length;

  return {
    products,
    count,
    hasMore
    //    };
  };
};

export default ListProductService;
