import AppError from "../../errors/AppError";
import { Coupon } from "../../models/Coupon";

interface Request {
  id: string | number
  companyId: number
}

const ShowCouponService = async ({id, companyId}: Request): Promise<Coupon> => {
  const coupon = await Coupon.findOne({where: {id, companyId}});

  if (!coupon) {
    throw new AppError("ERR_NO_COUPON_FOUND", 404);
  }

  return coupon;
};

export default ShowCouponService;
