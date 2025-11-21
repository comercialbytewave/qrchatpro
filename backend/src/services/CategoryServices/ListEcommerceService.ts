import { Op } from "sequelize";
import Category from "../../models/Category";
import Product from "../../models/Product";
import ProductStore from "../../models/ProductStore";
import AppError from "../../errors/AppError";
interface Request {
  companyId: number;
  storeId: number;
}

interface ICategoryRes {
  id: number;
  name: string;
  code: string | null;
}


const ListEcommerceService = async ({
  companyId,
  storeId
}: Request): Promise<ICategoryRes[]> => {
  if (!storeId) {
    throw new AppError("O código da loja deve ser informado.");
  }

  return await Category.findAll({
    attributes: ["id", "name", "code"],
    where: {
      companyId: companyId
    },
    include: [
      {
        model: Product,
        required: true,
        attributes: [],
        where: {
          isActive: true,
          companyId
        },
        include: [
          {
            model: ProductStore,
            required: true,
            where: { storeId, stock: { [Op.gt]: 0 } },
            include: [],
            attributes: []
          }
        ]
      }
    ],
    group: ["Category.id", "Category.name", "Category.code"],
    order: [["name", "ASC"]]
  });

  
};

export default ListEcommerceService;
