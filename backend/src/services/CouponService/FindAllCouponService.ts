import { Coupon } from "../../models/Coupon";

const FindAllCouponService = async (companyId): Promise<Coupon[]> => {
  const coupons = await Coupon.findAll({
    where: {
      companyId: companyId,
    },
    order: [["name", "ASC"]]
  });
  return coupons;
};

export default FindAllCouponService;
