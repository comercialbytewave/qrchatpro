import Product from "../../models/Product";
import Category from "../../models/Category";
import ProductStore from "../../models/ProductStore";
import AppError from "../../errors/AppError";
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

interface Request {
  companyId: number;
  storeId: number;
  productId: number;
}

const ShowWithPriceProductService = async ({
  companyId,
  storeId,
  productId
}: Request): Promise<IProductWithPrice> => {
  const result = await Product.findOne({
    where: { companyId, id: productId, isActive: true },
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
        where: { storeId, companyId },
        attributes: ["storeId", "stock", "sellingPrice", "promotionPrice"],
        required: true
      },
      {
        model: Category,
        where: { companyId },
        attributes: ["name"],
        required: true
      }
    ]
  });

  if (!result) {
    throw new AppError("Produto não encontrado");
  }

  const { productStore, category, ...data } = result.toJSON() as any;

  return {
    ...data,
    ...productStore[0],
    categoryName: category.name
  }
};

export default ShowWithPriceProductService;
