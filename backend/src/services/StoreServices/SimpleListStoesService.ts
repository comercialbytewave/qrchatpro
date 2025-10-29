import { Op, Sequelize } from "sequelize";
import Category from "../../models/Category";
import Store from "../../models/Stores";

interface Request {
  companyId: number;
  searchParam?: string;
}

const SimpleListStoreService = async ({
  companyId,
  searchParam,
}: Request): Promise<Store[]> => {
  let whereCondition = {};

  whereCondition = searchParam
    ? { name: { [Op.iLike]: `%${searchParam}%` }, companyId }
    : { companyId };

  const stores = await Store.findAll({
    where: { ...whereCondition, companyId  },
    order: [["name", "ASC"]]
  });

  return stores;
};

export default SimpleListStoreService;
