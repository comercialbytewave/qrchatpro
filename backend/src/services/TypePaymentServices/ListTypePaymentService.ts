import { Op, literal, fn, col } from "sequelize";
import TypePayments from "../../models/TypePayment";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  typePayments: TypePayments[];
  count: number;
  hasMore: boolean;
}

const ListTypePaymentService = async ({
  searchParam,
  pageNumber = "1"
}: Request): Promise<Response> => {
  let whereCondition = {};

  whereCondition = searchParam
    ? { code: { [Op.iLike]: `%${searchParam}%` } }
    : {};

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: typePayments } = await TypePayments.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["code", "ASC"]],
    subQuery: false,
    attributes: [
      "id",
      "code",
      "change",
      "installments"
    ],
    group: ["TypePayments.id"]
  });

  const hasMore = count > offset + typePayments.length;

  return {
    typePayments,
    count,
    hasMore
    //    };
  };
};

export default ListTypePaymentService;
