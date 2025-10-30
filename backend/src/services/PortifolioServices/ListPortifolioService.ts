import { Op } from "sequelize";
import Portifolio from "../../models/Portifolio";
import User from "../../models/User";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  portifolios: Portifolio[];
  count: number;
  hasMore: boolean;
}

const ListPortifolioService = async ({
  companyId,
  searchParam,
  pageNumber = 1
}: Request): Promise<Response> => {
  const page = Number(pageNumber) || 1;
  const limit = 20;
  const offset = limit * (page - 1);

  const whereCondition = {
    companyId,
    ...(searchParam && {
      name: { [Op.iLike]: `%${searchParam}%` }
    })
  };

  const { count, rows: portifolios } = await Portifolio.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],
    subQuery: false,
    attributes: ["id", "name", "userId"],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      }
    ],
    group: ["Portifolio.id", "user.id"]
  });

  // count is array when group is used
  const totalCount = Array.isArray(count) ? count.length : count;
  const hasMore = totalCount > offset + portifolios.length;

  return {
    portifolios,
    count: totalCount,
    hasMore
  };
};

export default ListPortifolioService;
