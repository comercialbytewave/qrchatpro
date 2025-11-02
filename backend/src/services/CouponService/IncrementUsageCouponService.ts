import AppError from "../../errors/AppError";
import { Coupon } from "../../models/Coupon";

interface Request {
  id: number;
  companyId: number;
}

const IncrementUsageCouponService = async ({
  id,
  companyId
}: Request): Promise<void> => {
  const coupon = await Coupon.findOne({ where: { id, companyId } });

  if (!coupon) {
    throw new AppError("Cupom não encontrado.", 404);   
  }

  if (!coupon.maxUsage) {
    return;
  }

  const currentUsage = Number(coupon.currentUsage ?? 0);

  if (currentUsage >= coupon.maxUsage) {
    throw new AppError("Limite de uso do cupom atingido.", 404);   
  }

  coupon.currentUsage = currentUsage + 1;

  await coupon.save();
};

export default IncrementUsageCouponService;
