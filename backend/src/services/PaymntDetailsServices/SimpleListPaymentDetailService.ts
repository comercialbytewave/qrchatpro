import { Op, Sequelize } from "sequelize";
import PaymentDetail from "../../models/PaymentDetails";

interface Request {
  companyId: number;
  paymentId: number | string;
  isActive?: boolean;
  searchParam?: string;
}

const SimpleListPaymentDetailService = async ({
  companyId,
  paymentId,
  searchParam
}: Request): Promise<PaymentDetail[]> => {
  let whereCondition: any = { companyId, paymentId };

  
  if (searchParam) {
    whereCondition[Op.and] = [
      { "$PaymentDetail.name$": { [Op.iLike]: `%${searchParam}%` } }
    ];
  }

  const paymentDetails = await PaymentDetail.findAll({
    where: whereCondition,
    order: [["type", "ASC"]],
    subQuery: false,
    attributes: [
      "id",
      "minimumValue",
      "installments",
      "paymentId"
    ],
    group: ["PaymentDetail.id"]
  });

  return paymentDetails;
};

export default SimpleListPaymentDetailService;
