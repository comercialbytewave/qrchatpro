import AppError from "../../errors/AppError";
import Product from "../../models/Product";

interface Request {
  id: string | number
  companyId: number
}

const ShowProductService = async ({id, companyId}: Request): Promise<Product> => {
  const product = await Product.findOne({where: {id, companyId}});

  if (!product) {
    throw new AppError("ERR_NO_PRODUCT_FOUND", 404);
  }

  return product;
};

export default ShowProductService;
