'use client'
import { notFound, useParams } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import ProductDetails from "./components/product-details";
import ProductHeader from "./components/product-header";
import { api } from "@/lib/api";
import { useSelectStore } from "@/components/select/useSelectStore";
import { ProdctsRelated } from "./components/products-related";


const ProductPage = () => {

  const { productId } = useParams<{ company: string, productId: string }>();
  const { selectedStore } = useSelectStore()

  const fetchProduct = async (productId: string) => {
    const { data } = await api.get(`/api/ecommerce/products/${selectedStore?.id}/${productId}`);
    return data
  }

  const { data: product, isLoading: isLodadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
  });

  if (!isLodadingProduct && !product) {
    return notFound();
  }

  return (
    <div className="flex h-full flex-col sm:flex-row sm: justify-center  ">
      {!isLodadingProduct &&
        <div
          className="flex flex-col justify-center items-center w-full"
        >
          <div className="w-full">
            <ProductHeader />
            <ProductDetails product={product} />
            <div className="w-full flex flex-wrap gap-2">
              <ProdctsRelated categoryId={product.categoryId} />
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default ProductPage;