"use client";

import { ScrollTextIcon, ShoppingBasket } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/data/context/useCart";
import { removeCpfPunctuation } from "@/helpers/helpers";
import imageFarmacia from '../../../../../public/varejo.png'

interface BranchHeaderProps {
  branch: any
}

const BranchHeader = ({ branch }: BranchHeaderProps) => {
  const { company } = useParams<{ company: string }>();
  const router = useRouter();
  const { toggleCart } = useCart()
  const searchParams = useSearchParams()
  const id = searchParams.get('id') as string

  const handleOrdersClick = () => {
    if (id) {
      router.replace(`/${company}/orders?id=${removeCpfPunctuation(id)}`);
    } else {
      router.replace(`/${company}/orders`);
    }
  }

  return (
    <div className="relative h-[250px] w-full">
      <Button
        variant="secondary"
        size="icon"
        className="absolute left-4 top-4 z-50 rounded-full"
        onClick={handleOrdersClick}
      >
        <ScrollTextIcon />
      </Button>
      <Image
        src={imageFarmacia}
        alt={branch?.name}
        fill
        className="object-cover"
        unoptimized
      // className="object-contain md:object-contain"
      />

      <Button
        variant="secondary"
        size="icon"
        className="absolute right-4 top-4 z-50 rounded-full"
        // disabled={productsInCart.length === 0}
        onClick={toggleCart}
      >
        <ShoppingBasket />
      </Button>
    </div>
  );
};

export default BranchHeader;
