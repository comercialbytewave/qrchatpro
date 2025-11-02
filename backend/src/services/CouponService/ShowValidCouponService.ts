import { Op } from "sequelize";
import { Coupon, CouponTypeEnum } from "../../models/Coupon";
import { getDateOnly } from "../../utils/get-date-only";
import AppError from "../../errors/AppError";

interface CouponData {
  code: string;
  type: CouponTypeEnum;
  value?: number;
  valueMin: number;
  startDate: Date;
  expirationDate: Date;
  maxUsage?: number;
}


interface Request {
  code?: string;
  id?: number;
  companyId: number;
}

const ShowValidCouponService = async ({
  code,
  id,
  companyId
}: Request): Promise<CouponData> => {
  if (!code && !id) {
    throw new AppError("Informe o ID ou o Código do Cupom.");
  }

  let coupon: Coupon;

  if (code) {
    coupon = await Coupon.findOne({
      where: {
        code,
        companyId,
        isActive: true,
        startDate: { [Op.lte]: getDateOnly() },
        expirationDate: { [Op.gte]: getDateOnly() }
      }
    });
  } else {
    coupon = await Coupon.findOne({
      where: {
        id,
        companyId,
        isActive: true,
        startDate: { [Op.lte]: getDateOnly() },
        expirationDate: { [Op.gte]: getDateOnly() }
      }
    });
  }

  if (!coupon || (coupon.maxUsage && coupon.currentUsage >= coupon.maxUsage)) {
    throw new AppError("Cupom inválido.");
  }

  return coupon;
};

export default ShowValidCouponService;
