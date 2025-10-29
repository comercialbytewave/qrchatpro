import { Op } from "sequelize";
import Product from "../../models/Product";
import Store from "../../models/Stores";
import ProductStore from "../../models/ProductStore";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
  storeId?: number; // Adicionamos o filtro de loja
}

interface Response {
  productStores: ProductStore[];
  count: number;
  hasMore: boolean;
}

const SearchProductStoreService = async ({
  companyId,
  searchParam,
  pageNumber = "1",
  storeId // Adicionamos storeId aqui
}: Request): Promise<Response> => {
  let whereCondition: any = {  companyId };

  // Adiciona a condição para o filtro de loja se storeId for fornecido
  if (storeId) {
    whereCondition.storeId = storeId;
  }

  if (searchParam) {
    // Cria um array de condições para 'name' e 'ean'
    whereCondition[Op.and] = [
      {
        [Op.or]: [
          { '$product.name$': { [Op.iLike]: `%${searchParam}%` } },
          { '$product.ean$': { [Op.iLike]: `%${searchParam}%` } } // Adiciona a pesquisa por EAN
        ]
      }
    ];
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
        attributes: ["id", "name", "ean", "code", "description", "isActive", "mediaPath", "mediaName", "categoryId"] // Certifique-se de que 'ean' está incluído aqui
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

export default SearchProductStoreService;