import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Payment from "../../models/Payment";
import TypePayments from "../../models/TypePayment";

interface Request {
  code: string;
  name: string;
  typePaymentId: number;
  companyId: number;
}

const CreatePaymentService = async ({
  code,
  name,
  typePaymentId,
  companyId,
}: Request): Promise<Payment> => {
  const schema = Yup.object().shape({
    code: Yup.string().required(),
    name: Yup.string().required().min(3)
  });

  try {
    await schema.validate({ code, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  //const maxCode = await Payment.max("code", {
  //  where: { companyId },
  //});

 // const nextCode = parseInt(String(maxCode ?? "0"), 10) + 1;

  const [payments] = await Payment.findOrCreate({
    where: { code, name, typePaymentId, companyId },
    defaults: { code, name, typePaymentId, companyId }
  });

  //await payments.reload();
  await payments.reload({ include: [{ model: TypePayments, as: "typePayment" }] });

  return payments;
};

export default CreatePaymentService;