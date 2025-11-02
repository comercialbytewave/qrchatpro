import { Op, Sequelize } from "sequelize";
import StatusBudGets from "../../models/StatusBudGets";

interface Request {
  companyId: number;
  searchParam?: string;
}

const SimpleListStatusBudGetService = async ({
  companyId,
  searchParam,
}: Request): Promise<StatusBudGets[]> => {
  let whereCondition = {};

  whereCondition = searchParam
    ? { name: { [Op.iLike]: `%${searchParam}%` }, companyId }
    : { companyId };

  const statusBudGets = await StatusBudGets.findAll({
    where: { ...whereCondition, companyId  },
    order: [["name", "ASC"]]
  });

  return statusBudGets;
};

export default SimpleListStatusBudGetService;
