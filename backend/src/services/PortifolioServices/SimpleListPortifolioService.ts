import { Op, Sequelize } from "sequelize";

import Portifolio from "../../models/Portifolio";

interface Request {
  companyId: number;
  searchParam?: string;
}

const SimpleListPortifolioService = async ({
  companyId,
  searchParam,
}: Request): Promise<Portifolio[]> => {
  let whereCondition = {};

  whereCondition = searchParam
    ? { name: { [Op.iLike]: `%${searchParam}%` }, companyId }
    : { companyId };

  const portifolios = await Portifolio.findAll({
    where: { ...whereCondition, companyId  },
    
    order: [["name", "ASC"]]
  });

  return portifolios;
};

export default SimpleListPortifolioService;
