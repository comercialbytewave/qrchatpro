import AppError from "../../errors/AppError";
import TypePayments from "../../models/TypePayment";

interface Request {
  id: string | number
}

const TypePaymentShowService = async ({id}: Request): Promise<TypePayments> => {
  const typePayment = await TypePayments.findOne({where: {id}});

  if (!typePayment) {
    throw new AppError("ERR_NO_TYPE_PAYMENT_FOUND", 404);
  }

  return typePayment;
};

export default TypePaymentShowService;
