import { Op } from "sequelize";

import PaymentDetails from "../../models/PaymentDetails";

interface Request {
  paymentId: string | number;
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  paymentDetails: PaymentDetails[];
  count: number;
  hasMore: boolean;
}

const ListPaymentDetailService = async ({
  paymentId,
  companyId,
  searchParam,
  pageNumber = "1"
}: Request): Promise<Response> => {
  let whereCondition: any = { paymentId, companyId };
 
  if (searchParam) {
    whereCondition[Op.and] = [{ '$PaymentDetails.installments$': { [Op.iLike]: `%${searchParam}%` } }];
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: paymentDetails } = await PaymentDetails.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["installments", "ASC"]],
    subQuery: false,
    attributes: [
     "id",
      "minimumValue",
      "installments",
      "paymentId"
    ],
    group: ["PaymentDetails.id"]
  });

  

  const hasMore = count > offset + paymentDetails.length;

  return {
    paymentDetails,
    count,
    hasMore
  };
};

export default ListPaymentDetailService;
