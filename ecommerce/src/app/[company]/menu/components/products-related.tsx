"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/helpers/helpers";
import { Button } from "@/components/ui/button"; import { useOrderStore } from "@/data/store/useOrderStore";

interface ProductsProps {
  products: any[];
}

const ProductsRelated = ({ products }: ProductsProps) => {

  const searchParams = useSearchParams()
  const { company } = useParams<{ company: string }>();
  const phone = searchParams.get('phone')
  const paramsphone = phone ? `phone=${phone}` : ''

  return (
    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 p-1 place-content-center">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between col-span-1 flex-col gap-1 md:w-60 group border shadow-md rounded-md p-2 md:h-min space-y-2"

        >
          <Link
            href={`/${company}/menu/${product.id}?${paramsphone}`}
            className="flex flex-col justify-center items-center w-full p-2 t border-b-2">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={120}
              height={120}
              className="rounded-lg object-cover"
              unoptimized
            />
            <h3 className="text-sm font-medium text-center truncate w-full mt-2">{product.name}</h3>
          </Link>
          <div
            className="grid grid-cols-3 w-full"
          >
            <div className="flex flex-col col-span-2 px-2 w-full">
              <span
                className="line-through"
              >
                {formatCurrency(product.price)}
              </span>
              <span
                className=""
              >
                {formatCurrency(product.price)}
              </span>
            </div>
            <div className="col-span-1 flex justify-center">
              <Button
                className="bg-red-600 hover:bg-red-500 text-white"
                size='icon'
              >
                -10%
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsRelated;
