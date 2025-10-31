import { Op, Sequelize } from "sequelize";
import { Coupon } from "../../models/Coupon";

interface Request {
  companyId: number;
  searchParam?: string;
}

const SimpleListCouponService = async ({
  companyId,
  searchParam,
}: Request): Promise<Coupon[]> => {
  let whereCondition = {};

  whereCondition = searchParam
    ? { name: { [Op.iLike]: `%${searchParam}%` }, companyId }
    : { companyId };

  const coupons = await Coupon.findAll({
    where: { ...whereCondition, companyId  },
    order: [["name", "ASC"]]
  });

  return coupons;
};

export default SimpleListCouponService;
