import AppError from "../../errors/AppError";
import Payment from "../../models/Payment";
import PaymentDetails from "../../models/PaymentDetails";
import TypePayments from "../../models/TypePayment";

const PaymentShowService = async (id: string | number): Promise<Payment> => {
  console.log(id)
  const payment = await Payment.findByPk(id, {
    include: [TypePayments, PaymentDetails],
  });

  if (!payment) {
    throw new AppError("ERR_NO_PAYMENT_FOUND", 404);
  }

  return payment;
};

export default PaymentShowService;
