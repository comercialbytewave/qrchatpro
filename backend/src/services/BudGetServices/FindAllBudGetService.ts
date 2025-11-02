// src/services/BudGetServices/FindAllBudGetService.ts
import BudGet from "../../models/BudGet";
import Company from "../../models/Company";
import Customer from "../../models/Customer";
import Store from "../../models/Stores";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import StatusBudGets from "../../models/StatusBudGets";
import BudGetItem from "../../models/BudGetItem";
import BudGetNegociation from "../../models/BudGetNegociation";
import BudGetAdressRouter from "../../models/BudGetAdressRouter";
import Product from "../../models/Product";

const FindAllBudGetService = async (companyId: number): Promise<BudGet[]> => {
  const budGets = await BudGet.findAll({
    where: { companyId },
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
            as: "product", // ⚠️ verifique se o alias está igual ao definido no model
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
    ],
    order: [["id", "ASC"]]
  });

  return budGets;
};

export default FindAllBudGetService;
