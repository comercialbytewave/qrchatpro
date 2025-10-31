import * as Yup from "yup";

import AppError from "../../errors/AppError";
import ShowService from "./PaymentShowService";
import Payment from "../../models/Payment";
import TypePayments from "../../models/TypePayment";

interface PaymentData {
  id?: number;
  code?: string;
  typePaymentId?: number;
  name?: string;
}

interface Request {
  paymentData: PaymentData;
  id: string | number;
}

const UpdatePaymentService = async ({
  paymentData,
  id
}: Request): Promise<Payment | undefined> => {
  const payment = await ShowService(id);

  const schema = Yup.object().shape({
    code: Yup.string().required(),
    name: Yup.string().min(3)
  });

  const { code, name, typePaymentId } = paymentData;

  try {
    await schema.validate({ code, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await payment.update({
    code,
    name,
    typePaymentId,
  });

  await payment.reload({ include: [{ model: TypePayments, as: "typePayment" }] });
  
  return payment;
};

export default UpdatePaymentService;
