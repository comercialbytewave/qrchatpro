import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { Coupon, CouponTypeEnum } from "../../models/Coupon";

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
  couponData: CouponData;
  id: string | number;
  companyId: number;
}

const UpdateCouponService = async ({
  couponData,
  id,
  companyId
}: Request): Promise<Coupon | undefined> => {
  const coupon = await Coupon.findOne({ where: { id, companyId } });

  if (!coupon) {
    throw new AppError("ERR_NO_CATEGORY_FOUND", 404);
  }

  const schema = Yup.object().shape({
    code: Yup.string()
      .typeError("O código deve ser uma string")
      .min(1, "O código do cupom é obrigatório")
      .nullable()
      .transform(value => (!value ? null : value)),

    type: Yup.mixed()
      .oneOf(["PERCENTUAL", "VALOR"], "Tipo inválido") // ajuste conforme seus enums
      .required("O tipo é obrigatório"),

    value: Yup.number()
      .typeError("O valor deve ser um número")
      .positive("O valor deve ser positivo.")
      .nullable()
      .transform(value => (value === undefined ? null : value)),

    valueMin: Yup.number()
      .typeError("O valor mínimo deve ser um número")
      .positive("O valor mínimo deve ser positivo")
      .min(0.01, "O valor mínimo deve ser no mínimo 0.01")
      .required("O valor mínimo é obrigatório"),

    startDate: Yup.date()
      .typeError("Data de início inválida")
      .transform(value => {
        const date = new Date(value);
        if (isNaN(date.getTime())) return null;
        return new Date(date.toISOString().split("T")[0]);
      })
      .required("A data de início é obrigatória"),

    expirationDate: Yup.date()
      .typeError("Data de expiração inválida")
      .transform(value => {
        const date = new Date(value);
        if (isNaN(date.getTime())) return null;
        return new Date(date.toISOString().split("T")[0]);
      })
      .required("A data de expiração é obrigatória"),

    maxUsage: Yup.number()
      .typeError("Quantidade máxima de uso deve ser um número inteiro")
      .integer("A quantidade máxima de uso deve ser um número inteiro")
      .min(0, "A quantidade máxima de uso não pode ser negativa.")
      .nullable()
      .transform(value => (value === 0 ? null : value))
  });

  const { code, type, value, valueMin, startDate, expirationDate, maxUsage } =
    couponData;

  try {
    await schema.validate({
      code,
      type,
      value,
      valueMin,
      startDate,
      expirationDate,
      maxUsage
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (code && code !== coupon.code) {
    const codeExists = await Coupon.findOne({ where: { code, companyId } });

    if (codeExists) {
      throw new AppError("ERR_COUPON_CONFLICT_CODE", 409);
    }
  }

  await coupon.update({
    code,
    type,
    value,
    valueMin,
    startDate,
    expirationDate,
    maxUsage
  });

  await coupon.reload();
  return coupon;
};

export default UpdateCouponService;
