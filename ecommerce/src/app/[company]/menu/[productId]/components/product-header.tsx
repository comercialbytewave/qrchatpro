"use client";

import { ChevronLeftIcon, ShoppingBasket } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/data/context/useCart";
import { useSelectStore } from "@/components/select/useSelectStore";

import imageFarmacia from '../../../../../../public/varejo.png'


const ProductHeader = () => {
  const router = useRouter();
  const handleBackClick = () => router.back();
  const { toggleCart, productsInCart } = useCart()
  const { selectedStore } = useSelectStore()
  return (
    <div className="relative min-h-[300px] w-full">
      <Button
        variant="secondary"
        size="icon"
        className="absolute left-4 top-4 z-50 rounded-full"
        onClick={handleBackClick}
      >
        <ChevronLeftIcon />
      </Button>
      <Image
        src={imageFarmacia}
        alt={selectedStore?.name ?? 'Farmacia'}
        fill
        className="object-cover"
        unoptimized
      />

      <Button
        variant="secondary"
        size="icon"
        className="absolute right-4 top-4 z-50 rounded-full"
        disabled={productsInCart.length === 0}
        onClick={toggleCart}
      >
        <ShoppingBasket />
      </Button>
    </div>
  );
};

export default ProductHeader;
