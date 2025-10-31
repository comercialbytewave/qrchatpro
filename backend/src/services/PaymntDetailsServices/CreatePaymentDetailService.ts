import * as Yup from "yup";

import AppError from "../../errors/AppError";
import PaymentDetails from "../../models/PaymentDetails";

interface Request {
  minimumValue: number;
  installments: number;
  paymentId: number;
  companyId: number;
}

const CreatePaymentDetailService = async ({
  minimumValue,
  installments,
  paymentId,
  companyId
}: Request): Promise<PaymentDetails> => {
  const schema = Yup.object().shape({
    minimumValue: Yup.string().required(),
    installments: Yup.string().required(),
    companyId: Yup.number().required()
  });

  try {
    await schema.validate({
      minimumValue,
      installments,
      paymentId,
      companyId
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const existingRecord = await PaymentDetails.findOne({
    where: {
      minimumValue,
      installments,
      paymentId,
      companyId
    }
  });

  if (existingRecord) {
    throw new AppError(
      "A parcela já está cadastrada para o pagamento informado"
    );
  }

  const [paymentDetail] = await PaymentDetails.findOrCreate({
    where: {
      minimumValue,
      installments,
      paymentId,
      companyId
    },
    defaults: {
      minimumValue,
      installments,
      paymentId,
      companyId
    }
  });

  await paymentDetail.reload();

  return paymentDetail;
};

export default CreatePaymentDetailService;
