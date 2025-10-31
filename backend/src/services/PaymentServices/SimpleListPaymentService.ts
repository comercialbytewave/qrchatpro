import { Op, Sequelize } from "sequelize";
import Payment from "../../models/Payment";
import TypePayments from "../../models/TypePayment";
import PaymentDetails from "../../models/PaymentDetails";

interface Request {
  companyId: number;
  searchParam?: string;
}

const SimpleListPaymentService = async ({
  companyId,
  searchParam
}: Request): Promise<Payment[]> => {
  let whereCondition = {};

  whereCondition = searchParam
    ? { name: { [Op.iLike]: `%${searchParam}%` }, companyId }
    : { companyId };

  const payments = await Payment.findAll({
    where: { ...whereCondition, companyId },
    include: [TypePayments, PaymentDetails],
    order: [["code", "ASC"]]
  });

  return payments;
};

export default SimpleListPaymentService;
