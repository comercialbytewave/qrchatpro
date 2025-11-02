import { Op, literal, fn, col } from "sequelize";
import StatusBudGets from "../../models/StatusBudGets";
interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  statusBudGets: StatusBudGets[];
  count: number;
  hasMore: boolean;
}

const ListStatusBudGetService = async ({
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

  const { count, rows: statusBudGets } = await StatusBudGets.findAndCountAll({
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
    group: ["StatusBudGets.id"]
  });

  const hasMore = count > offset + StatusBudGets.length;

  return {
    statusBudGets,
    count,
    hasMore
    //    };
  };
};

export default ListStatusBudGetService;
