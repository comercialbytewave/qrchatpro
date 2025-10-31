import { Op, literal, fn, col } from "sequelize";
import { Coupon } from "../../models/Coupon";
interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  coupons: Coupon[];
  count: number;
  hasMore: boolean;
}

const ListCouponService = async ({
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

  const { count, rows: coupons } = await Coupon.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],
    subQuery: false,
    attributes: [
      "id",
      "code",
      "type",
      "value",
      "valueMin",
      "startDate",
      "expirationDate",
      "maxUsage",
    ],
    group: ["Coupon.id"]
  });

  const hasMore = count > offset + coupons.length;

  return {
    coupons,
    count,
    hasMore
    //    };
  };
};

export default ListCouponService;
