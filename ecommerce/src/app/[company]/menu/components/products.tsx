"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { calcPercentage, formatCurrency, normalizeImage, selectMinusPrice } from "@/helpers/helpers";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCart } from "@/data/context/useCart";
import { Product } from "@/data/store/interfaces/product";
import nophoto from '../../../../../public/nophoto.jpg'

interface ProductsProps {
  products: Product[];
}

const Products = ({ products }: ProductsProps) => {
  const { toggleCart, addProduct, productsInCart } = useCart();

  const searchParams = useSearchParams()
  const { company } = useParams<{ company: string }>();
  const id = searchParams.get('id');
  const paramsid = id ? `id=${id}` : ''

  const handleAddToCart = (product: Product) => {
    addProduct({
      ...product,
      quantity: 1,
      price: selectMinusPrice(product),
      fullPrice: Number(product.sellingPrice)
    });
    toggleCart();
  };



  const handleShowPrice = (product: Product) => {
    const sellingPrice = Number(product.sellingPrice)
    const promotionPrice = Number(product.promotionPrice)
    return <div
      className="grid grid-cols-3 w-full  place-items-center"
    >
      {promotionPrice === 0 ? (
        <div className="flex flex-col col-span-2 px-2 w-full">
          <span
            className=""
          >
            {formatCurrency(sellingPrice)}
          </span>
        </div>)

        : (
          <>
            <div className="flex flex-col col-span-2 px-2 w-full" >
              <span
                className="line-through"
              >
                {formatCurrency(sellingPrice)}
              </span>
              <span
                className=""
              >
                {formatCurrency(promotionPrice)}
              </span>
            </div >
            <div className="col-span-1 flex justify-center">
              <Button
                className="bg-red-600 hover:bg-red-500 text-white"
                size='icon'
              >
                {`${calcPercentage(sellingPrice, promotionPrice)}%`}
              </Button>
            </div>
          </>
        )}
    </div>
  }

  return (
    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 p-1 place-content-center">
      {products.map((product) => {
        let disabledProduct = false
        const productInCart = productsInCart.find(item => item.id === product.id)
        if (productInCart !== undefined && productInCart.quantity >= Number(product.stock)) {
          disabledProduct = true
        }
        return (
          <div
            key={product.id}
            className="flex items-center justify-between col-span-1 flex-col md:w-60 group border shadow-md rounded-md p-2 "

          >
            <Link
              href={`/${company}/menu/${product.id}?${paramsid}`}
              className="flex flex-col justify-center items-center p-2 w-40 h-40 relative">
              <Image
                src={product.mediaPath !== "" ? normalizeImage(product.mediaPath, product.companyId) : nophoto}
                alt={product.name}
                fill
                className="rounded-lg object-contain"
                unoptimized
              />
            </Link>
            <h3 className="text-sm font-medium text-center truncate w-full border-b-2  mt-2">{product.name}</h3>
            <div className="w-full flex my-1">
              {handleShowPrice(product)}
            </div>
            <div
            >
              <Button
                type="button"
                onClick={() => handleAddToCart(product)}
                disabled={disabledProduct}
                className="flex md:opacity-0 md:group-hover:opacity-100 transition-all duration-300  font-bold "
              >
                Adicionar
                <Plus strokeWidth={3} className="text-whiterounded-sm" />
              </Button>
            </div>
          </div>
        )
      })}
    </div >
  );
};

export default Products;
