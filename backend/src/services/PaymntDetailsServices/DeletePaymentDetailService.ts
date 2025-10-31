
import AppError from "../../errors/AppError";
import PaymentDetail from "../../models/PaymentDetails";



const DeletePaymentDetailService = async (id: string | number): Promise<void> => {
  const paymentDetail = await PaymentDetail.findOne({
    where: { id }
  });

  if (!paymentDetail) {
    throw new AppError("ERR_NO_CONTACT_ADDRESS_FOUND", 404);
  }

  await paymentDetail.destroy();
};

export default DeletePaymentDetailService;
