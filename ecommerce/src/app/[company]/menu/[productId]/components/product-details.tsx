"use client";

import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calcPercentage, formatCurrency, normalizeImage, selectMinusPrice } from "@/helpers/helpers";

import CartSheet from "../../components/cart-sheet";
import { useCart } from "@/data/context/useCart";
import { Product } from "@/data/store/interfaces/product";
import Image from "next/image";
import { useCompanytStore } from "@/data/store/useCompanyStore";
import nophoto from '../../../../../../public/nophoto.jpg'
import logoInfarma from '../../../../../../public/logo.png'
import logoWhite from '../../../../../../public/logo-white.png'
import { useTheme } from "next-themes";

interface ProductDetailsProps {
  product: Product
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const { toggleCart, addProduct, productsInCart, increaseProductQuantity, decreaseProductQuantity, removeProduct } = useCart()
  const { companyStore } = useCompanytStore()

  const handleDecreaseQuantity = () => {
    if (productsInCart.find(item => item.id === product.id)?.quantity === 1) {
      removeProduct(product.id);
      return;
    }
    decreaseProductQuantity(product.id);
  };

  const handleIncreaseQuantity = () => {
    increaseProductQuantity(product.id)
  };

  const productCurrent = useMemo(() => {
    return productsInCart.find((productInCart) => productInCart.id === product.id);
  }, [productsInCart])


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
      className="flex w-full"
    >
      {promotionPrice === 0 ? (
        <div className="flex flex-col col-span-2 px-2 w-full">
          <span
            className="font-bold text-2xl"
          >
            {formatCurrency(sellingPrice)}
          </span>
        </div>)
        : (
          <>
            <div className=" flex w-full col-span-2 justify-between " >
              <div className="flex flex-col px-2 w-full">
                <span
                  className="line-through text-md font-semibold"
                >
                  {formatCurrency(sellingPrice)}
                </span>
                <span
                  className="font-bold text-xl"
                >
                  {formatCurrency(promotionPrice)}
                </span>
              </div>
              <div>
                <Button
                  className="bg-red-600 hover:bg-red-500 text-white"
                  size='icon'
                >
                  {`${calcPercentage(sellingPrice, promotionPrice)}%`}
                </Button>
              </div>
            </div >

          </>
        )}
    </div>
  }

  const productUnAvailable = useMemo(() => {
    const productInCart = productsInCart.find(item => item.id === product.id)
    if (productInCart !== undefined && productInCart.quantity >= Number(product.stock)) {
      return true
    }
    return false
  }, [productsInCart, product])


  const { theme } = useTheme()

  const logo = theme === 'dark' ? logoWhite : logoInfarma


  return (
    <>
      <div className="relative z-50 mt-[-1.5rem] flex flex-auto flex-col bg-background overflow-hidden rounded-t-3xl p-5">
        <div className="flex-col overflow-hidden ">
          <div className="flex items-center gap-1.5 ">
            <Image
              src={companyStore?.mediaPath ? normalizeImage(companyStore?.mediaPath, companyStore.id) : logo}
              alt={'logo_farmacia'}
              width={16}
              height={16}
              className="rounded-full "
              unoptimized
            />
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">
                {companyStore?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {companyStore?.phone}
              </p>
            </div>
          </div>
          <div className="flex mt-2 justify-between">
            <Image
              src={product.mediaPath !== "" ? normalizeImage(product.mediaPath, product.companyId) : nophoto}
              alt={'produto'}
              width={160}
              height={160}
              className="rounded-md aspect-square object-contain border"
              unoptimized
            />
            <div className=" flex flex-col items-end justify-between  w-full">
              {handleShowPrice(product)}
              {productCurrent !== undefined &&
                <div className="flex items-center gap-3 text-center">
                  <Button
                    variant="outline"
                    className="h-8 w-8 rounded-xl"
                    onClick={() => handleDecreaseQuantity()}
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <p className="w-4">{productCurrent.quantity}</p>
                  <Button
                    variant="destructive"
                    className="h-8 w-8 rounded-xl"
                    disabled={productUnAvailable}
                    onClick={() => handleIncreaseQuantity()}
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>}
            </div>
          </div>

          <ScrollArea className="h-full my-2">
            <div className="mt-6 space-y-3">

              <h2 className="mt-1 text-xl font-semibold">{product.name}</h2>
              <h4 className="font-semibold">Sobre</h4>
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>
          </ScrollArea>
        </div>
        <Button
          disabled={productUnAvailable}
          className="w-full max-w-[600px] self-center rounded-full  font-bold"
          onClick={() => handleAddToCart(product)}>
          Adicionar à sacola
        </Button>
      </div>
      {/* <CartSheet /> */}
    </>
  );
};

export default ProductDetails;
