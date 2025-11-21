import { notFound } from "next/navigation";
import ProductDetails from "./components/product-details";
import ProductHeader from "./components/product-header";
import { api } from "@/lib/api";

interface ProductPageProps {
  params: Promise<{ company: string; productId: string }>;
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { company, productId } = await params;
  const { data: product } = await api.get(`/products/findById?productId=${productId}`);



  if (!product) {
    return notFound();
  }
  if (product.branch.company.toUpperCase() !== company.toUpperCase()) {
    return notFound();
  }

  return (
    <div className="flex h-full flex-col sm:flex-row sm: justify-center p-4">
      <div
        className="flex"
      >
        <ProductHeader />
        <ProductDetails product={product} />
      </div>
    </div>
  );
};

export default ProductPage;