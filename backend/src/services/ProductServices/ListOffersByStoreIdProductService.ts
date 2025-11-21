import { Op } from "sequelize";
import Product from "../../models/Product";
import Category from "../../models/Category";
import ProductStore from "../../models/ProductStore";
interface IPaginatedResult<T> {
  first: number;
  prev: number | null;
  next: number;
  last: number;
  pages: number;
  items: number;
  data: Array<T>;
}
interface IFilterListByCategoryIdAndStoreId {
  companyId: number;
  storeId: number;
  categoryId?: number;
  searchParam?: string;
  pageNumber?: number;
  pageSize?: number;
}

interface IProductWithPrice {
  id: number;
  ean: string;
  name: string;
  code: string;
  description: string;
  categoryId: number;
  media: string | null;
  storeId: number;
  stock: number;
  sellingPrice: number;
  promotionPrice: number;
  categoryName: string;
}
const ListOffersByStoreIdProductService = async ({
  companyId,
  storeId,
  searchParam,
  pageNumber = 1,
  pageSize = 20
}: IFilterListByCategoryIdAndStoreId): Promise<
  IPaginatedResult<IProductWithPrice>
> => {
  const whereCondition: any = {
    companyId,
    isActive: true
  };

  if (searchParam) {
    whereCondition[Op.or] = [
      { name: { [Op.iLike]: `%${searchParam}%` } },
      { ean: { [Op.iLike]: `%${searchParam}%` } },
      { code: { [Op.iLike]: `%${searchParam}%` } }
    ];
  }
  const offset = pageSize * (pageNumber - 1);

  const { count, rows } = await Product.findAndCountAll({
    where: whereCondition,
    attributes: [
      "id",
      "ean",
      "name",
      "code",
      "description",
      "categoryId",
      "mediaPath",
      "mediaName",
      "companyId"
    ],
    include: [
      {
        model: ProductStore,
        where: {
          storeId,
          companyId,
          promotionPrice: { [Op.gt]: 0 },
          stock: { [Op.gt]: 0 }
        },
        attributes: ["storeId", "stock", "sellingPrice", "promotionPrice"],
        required: true
      },
      {
        model: Category,
        where: { companyId },
        attributes: ["name"],
        required: true
      }
    ],
    order: [["name", "ASC"]],
    limit: pageSize,
    offset
  });

  const products = rows.map(item => {
    const { productStore, category, ...data } = item.toJSON() as any;

    return {
      ...data,
      ...productStore[0],
      categoryName: category.name
    };
  });

  const last = Math.ceil(count / pageSize);

  return {
    first: 1,
    prev: pageNumber === 1 ? null : pageNumber - 1,
    next: pageNumber < last ? pageNumber + 1 : null,
    last,
    pages: last,
    items: count,
    data: products
  };
};

export default ListOffersByStoreIdProductService;
