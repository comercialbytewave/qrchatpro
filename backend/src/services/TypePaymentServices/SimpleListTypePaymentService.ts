import { Op, Sequelize } from "sequelize";
import TypePayments from "../../models/TypePayment";


interface Request {
  searchParam?: string;
}

const SimpleListTypePaymentService = async ({
  searchParam,
}: Request): Promise<TypePayments[]> => {
  let whereCondition = {};

  whereCondition = searchParam
    ? { name: { [Op.iLike]: `%${searchParam}%` } }
    : {};

  const typePayments = await TypePayments.findAll({
    where: { ...whereCondition  },
    order: [["code", "ASC"]]
  });

  return typePayments;
};

export default SimpleListTypePaymentService;
