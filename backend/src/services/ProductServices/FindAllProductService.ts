import Category from "../../models/Category";
import Plan from "../../models/Plan";
import Product from "../../models/Product";

const FindAllProductService = async (companyId): Promise<Product[]> => {
  const products = await Product.findAll({
    where: {
      companyId: companyId,
    },
    order: [["name", "ASC"]]
  });
  return products;
};

export default FindAllProductService;
