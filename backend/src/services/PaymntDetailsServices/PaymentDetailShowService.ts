import AppError from "../../errors/AppError";
import PaymentDetail from "../../models/PaymentDetails";

const PaymentDetailShowService = async (id: string | number): Promise<PaymentDetail> => {
  const paymentDetails = await PaymentDetail.findByPk(id);

  if (!paymentDetails) {
    throw new AppError("ERR_NO_PAYMENT_DETAIL_NOT_FOUND", 404);
  }

  return paymentDetails;
};

export default PaymentDetailShowService;
