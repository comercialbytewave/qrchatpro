import { Op, Sequelize, where } from "sequelize";
import Category from "../../models/Category";
import Product from "../../models/Product";
import ProductStore from "../../models/ProductStore";
import Store from "../../models/Stores";

interface Request {
  companyId: number;
  storeId: number | string;
  productId: string;
}

const SimpleListProductStoreProductService = async ({
  companyId,
  storeId,
  productId
}: Request): Promise<ProductStore> => {
  let whereCondition: any = {
    companyId,
    storeId,
  };
console.log(storeId, productId);
    
  const productStores = await ProductStore.findOne({
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
        attributes: ["id", "ean", "name", "description", "mediaPath", "mediaName"],
        ...(productId && {
          where: {
            id: productId,
          },
        }),
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

export default SimpleListProductStoreProductService;
