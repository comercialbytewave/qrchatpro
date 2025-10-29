import { Op } from "sequelize";
import Product from "../../models/Product";
import Store from "../../models/Stores";
import ProductStore from "../../models/ProductStore";

interface Request {
  productId: string | number;
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  productStores: ProductStore[];
  count: number;
  hasMore: boolean;
}

const ListProductStoreService = async ({
  productId,
  companyId,
  searchParam,
  pageNumber = "1"
}: Request): Promise<Response> => {
  let whereCondition: any = { productId, companyId };

  if (searchParam) {
    whereCondition[Op.and] = [{ '$product.name$': { [Op.iLike]: `%${searchParam}%` } }];
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: productStores } = await ProductStore.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [[{ model: Product, as: "product" }, "name", "ASC"]],
    subQuery: false,
    attributes: [
      "id",
      "productId",
      "storeId",
      "stock",
      "costPrice",
      "sellingPrice",
      "promotionPrice"
    ],
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "name"]
      },
      {
        model: Store,
        as: "store",
        attributes: ["id", "name"]
      }
    ],
    group: ["ProductStore.id", "product.id", "store.id"]
  });

  const hasMore = count > offset + productStores.length;

  return {
    productStores,
    count,
    hasMore
  };
};

export default ListProductStoreService;
