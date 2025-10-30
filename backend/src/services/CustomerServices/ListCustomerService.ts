// src/services/ListCustomerService.ts
import { Op } from "sequelize";

import Customer from "../../models/Customer";
import Portifolio from "../../models/Portifolio";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  customers: Customer[];
  count: number;
  hasMore: boolean;
}

const ListCustomerService = async ({
  companyId,
  searchParam,
  pageNumber = "1"
}: Request): Promise<Response> => {
  const whereCondition = searchParam
    ? { fullName: { [Op.iLike]: `%${searchParam}%` }, companyId }
    : { companyId };

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: customers } = await Customer.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["fullName", "ASC"]],
    attributes: ["id", "document", "fullName", "email", "birthday", "portifolioId", "customerDefault"],
    include: [
      {
        model: Portifolio,
        as: "portifolio",
        attributes: ["id", "name"]
      }
    ]
  });

  const hasMore = count > offset + customers.length;

  return {
    customers,
    count,
    hasMore
  };
};

export default ListCustomerService;
