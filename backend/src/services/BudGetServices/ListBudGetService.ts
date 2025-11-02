// src/services/BudGetServices/ListBudGetService.ts
import { Op } from "sequelize";
import BudGet from "../../models/BudGet";
import Company from "../../models/Company";
import Customer from "../../models/Customer";
import Store from "../../models/Stores";
import User from "../../models/User";
import StatusBudGets from "../../models/StatusBudGets";
import BudGetItem from "../../models/BudGetItem";
import Product from "../../models/Product";
import BudGetNegociation from "../../models/BudGetNegociation";
import BudGetAdressRouter from "../../models/BudGetAdressRouter";

interface Request {
  companyId: number;
  searchParam?: string;
  customerId?: number;
  statusBudGetId?: number;
  pageNumber?: string | number;
}

interface Response {
  budGets: BudGet[];
  count: number;
  hasMore: boolean;
}

const ListBudGetService = async ({
  companyId,
  searchParam,
  customerId,
  statusBudGetId,
  pageNumber = "1"
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  // Monta condição WHERE dinâmica
  const whereCondition: any = { companyId };

  if (customerId) whereCondition.customerId = customerId;
  if (statusBudGetId) whereCondition.statusBudGetId = statusBudGetId;
  if (searchParam) {
    whereCondition[Op.or] = [
      { "$customer.fullName$": { [Op.iLike]: `%${searchParam}%` } },
      { "$statusBudGet.name$": { [Op.iLike]: `%${searchParam}%` } }
    ];
  }

  const { count, rows: budGets } = await BudGet.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["id", "DESC"]],
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name"]
      },
      {
        model: Customer,
        as: "customer",
        attributes: ["id", "fullName", "document", "email", "birthday"]
      },
      {
        model: Store,
        as: "store",
        attributes: ["id", "name"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        model: StatusBudGets,
        as: "statusBudGet",
        attributes: ["id", "name", "code"]
      },
      {
        model: BudGetItem,
        as: "BudGetItens",
        attributes: ["id", "productId", "amount", "unitary", "total"],
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "ean", "mediaPath", "mediaName"]
          }
        ]
      },
      {
        model: BudGetNegociation,
        as: "BudGetNegotiations",
        attributes: ["id", "paymentId", "value", "installments", "change"]
      },
      {
        model: BudGetAdressRouter,
        as: "BudGetAdressRouters",
        attributes: [
          "id",
          "zipCode",
          "address",
          "number",
          "complement",
          "neighborhood",
          "city",
          "state"
        ]
      }
    ]
  });

  const hasMore = count > offset + budGets.length;

  return {
    budGets,
    count,
    hasMore
  };
};

export default ListBudGetService;
