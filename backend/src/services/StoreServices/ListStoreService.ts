import { Op, literal, fn, col } from "sequelize";
import Store from "../../models/Stores";
interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  stores: Store[];
  count: number;
  hasMore: boolean;
}

const ListStoreService = async ({
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

  const { count, rows: stores } = await Store.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],
    subQuery: false,
    attributes: [
      "id",
      "document",
      "name",
      "fantasy",
      "zipCode",
      "address",
      "number",
      "complement",
      "neighborhood",
      "city",
      "state",
      "isActive",
      "latitude",
      "longitude"
    ],
    group: ["Store.id"]
  });

  const hasMore = count > offset + stores.length;

  return {
    stores,
    count,
    hasMore
    //    };
  };
};

export default ListStoreService;
