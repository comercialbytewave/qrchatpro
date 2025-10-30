import { Op } from "sequelize";
import Customer from "../../models/Customer";
import Contact from "../../models/Contact";

interface Request {
  companyId: number;
  searchParam?: string;
}

const SimpleListCustomerService = async ({
  companyId,
  searchParam,
}: Request): Promise<Customer[]> => {
  const whereCondition = searchParam
    ? { fullName: { [Op.iLike]: `%${searchParam}%` }, companyId }
    : { companyId };

  const customers = await Customer.findAll({
    where: whereCondition,
    order: [["fullName", "ASC"]],
    include: [
      {
        model: Contact,
        as: "contacts", // corrigido aqui
        attributes: ["id", "name", "email", "number"],
      }
    ]
  });

  return customers;
};

export default SimpleListCustomerService;
