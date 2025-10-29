import { Op, Sequelize, where } from "sequelize";
import Category from "../../models/Category";
import Product from "../../models/Product";
import ProductStore from "../../models/ProductStore";
import Store from "../../models/Stores";

interface Request {
  companyId: number;
  storeId?: number | string;
  searchParam?: string;
  isActive?: boolean;
}

const SimpleListProductStoreService = async ({
  companyId,
  storeId,
  searchParam,
  isActive = false
}: Request): Promise<ProductStore[]> => {
  let whereCondition: any = {
    companyId,
    storeId
  };

  const andConditions: any[] = [];

  if (searchParam) {
    andConditions.push({
      [Op.or]: [
        { '$product.name$': { [Op.iLike]: `%${searchParam}%` } },
        { '$product.ean$': { [Op.eq]: searchParam } }
      ]
    });
  }

  if (isActive) {
    andConditions.push({
      '$product.isActive$': true
    });
  }

  if (andConditions.length > 0) {
    whereCondition[Op.and] = andConditions;
  }
  
  const productStores = await ProductStore.findAll({
    where: whereCondition,
    order: [[{ model: Product, as: "product" }, "name", "ASC"]],
    subQuery: false,
    attributes: [
      "id",
      "productId",
      "product.ean",
      "product.name",
      "storeId",
      "stock",
      "costPrice",
      "sellingPrice",
      "promotionPrice",
      "product.mediaPath",
      "product.mediaName"
    ],
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "ean", "name"]
      },
      {
        model: Store,
        as: "store",
        attributes: ["id", "name"]
      }
    ],
    group: ["ProductStore.id", "product.id", "store.id"]
  });
  

  return productStores;
};

export default SimpleListProductStoreService;
