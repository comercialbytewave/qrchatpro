import PaymentDetail from "../../models/PaymentDetails";


const ShowPaymentDetailService = async (paymentId: string | number): Promise<PaymentDetail[]> => {
  const paymentDetails = await PaymentDetail.findAll({
    where: {
      paymentId: paymentId
    }
  });

  return paymentDetails;
};

export default ShowPaymentDetailService;
