import { Op, Sequelize } from "sequelize";
import Product from "../../models/Product";

interface Request {
  companyId: number;
  searchParam?: string;
}

const SimpleListProductService = async ({
  companyId,
  searchParam,
}: Request): Promise<Product[]> => {
  let whereCondition = {};

  whereCondition = searchParam
    ? { name: { [Op.iLike]: `%${searchParam}%` }, companyId }
    : { companyId };

  const products = await Product.findAll({
    where: { ...whereCondition, companyId  },
    order: [["name", "ASC"]]
  });

  return products;
};

export default SimpleListProductService;
