import AppError from "../../errors/AppError";
import { Coupon } from "../../models/Coupon";

interface Request {
  id: number;
  companyId: number;
}

const DeactivateCouponService = async ({
  id,
  companyId
}: Request): Promise<void> => {
  const coupon = await Coupon.findOne({ where: { id, companyId } });

  if (!coupon) {
    throw new AppError("Cupom não encontrado.", 404);    
  }

  if (!coupon.isActive) {
    throw new AppError("Cupom já está inativo.", 404);    
  }

  await coupon.update({ isActive: false });
};

export default DeactivateCouponService;
