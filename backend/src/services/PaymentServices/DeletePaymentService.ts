
import AppError from "../../errors/AppError";
import Payment from "../../models/Payment";

const DeletePaymentService = async (id: string | number): Promise<void> => {
  const payment = await Payment.findOne({
    where: { id }
  });

  if (!payment) {
    throw new AppError("ERR_NO_PAYMENT_FOUND", 404);
  }

  await payment.destroy();
};

export default DeletePaymentService;
