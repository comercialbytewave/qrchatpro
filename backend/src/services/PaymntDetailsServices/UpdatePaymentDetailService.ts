import * as Yup from "yup";

import AppError from "../../errors/AppError";
import PaymentDetail from "../../models/PaymentDetails";
import PaymentDetailShowService from "./PaymentDetailShowService";

interface paymentDetailData {
  paymentDetailId?: number;
  minimumValue?: number;
  installments?: number;
  paymentId?: number;
  companyId?: number;
}

interface Request {
  paymentDetailData: paymentDetailData;
  id: string | number;
}

const UpdatePaymentDetailService = async ({
  paymentDetailData,
  id
}: Request): Promise<PaymentDetail | undefined> => {
  const paymentDetail = await PaymentDetailShowService(id);

  const schema = Yup.object().shape({
    paymentDetailId: Yup.number().required(),
    minimumValue: Yup.string().required(),
    installments: Yup.string().required(),
    companyId: Yup.number().required()
  });

  const {
    paymentDetailId,
    minimumValue,
    installments,
    paymentId,
    companyId
  } = paymentDetailData;

  try {
    await schema.validate({
      paymentDetailId,
      minimumValue,
      installments,
      paymentId,
      companyId
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

   await paymentDetail.update(paymentDetailData);

  await paymentDetail.reload();
  return paymentDetail;
};

export default UpdatePaymentDetailService;
