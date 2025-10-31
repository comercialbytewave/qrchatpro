import { Op, literal, fn, col } from "sequelize";
import Payment from "../../models/Payment";
import TypePayments from "../../models/TypePayment";
import PaymentDetails from "../../models/PaymentDetails";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  payments: Payment[];
  count: number;
  hasMore: boolean;
}

const ListPaymentService = async ({
  companyId,
  searchParam,
  pageNumber = "1"
}: Request): Promise<Response> => {
  let whereCondition = {};

  whereCondition = searchParam
    ? { name: { [Op.iLike]: `%${searchParam}%` }, companyId }
    : { companyId };

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: payments } = await Payment.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["code", "ASC"]],
    subQuery: false,
    attributes: ["id", "code", "name", "typePaymentId"],
    include: [
      {
        model: TypePayments,
        as: "typePayment",
        attributes: ["id", "code", "change", "installments"]
      },
      {
        model: PaymentDetails,
        as: "paymentDetails",
        attributes: ["id", "minimumValue", "installments"]
      }
    ],
    group: [
      "Payment.id",
      "typePayment.id",
      "typePayment.code",
      "typePayment.change",
      "typePayment.installments",
      "paymentDetails.id"
    ]
  });

  const hasMore = count > offset + payments.length;

  return {
    payments,
    count,
    hasMore
  };
};

export default ListPaymentService;