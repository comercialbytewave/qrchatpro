"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatCurrency, normalizeImage } from "@/helpers/helpers";
import CartSheet from "./cart-sheet";
import Products from "./products";
import { useQuery } from '@tanstack/react-query';
import { api } from "@/lib/api";
import { DebouncedInput } from "@/components/input/debouce-input";
import { PaginationComponent } from "@/components/pagination/pagination";
import { useCart } from "@/data/context/useCart";
import FinishOrderDialog from "./finish-order-dialog";
import { Category } from "@/data/store/interfaces/categories";
import { useSelectStore } from "@/components/select/useSelectStore";
import { useCompanytStore } from "@/data/store/useCompanyStore";
import { Product } from "@/data/store/interfaces/product";
import logoInfarma from '../../../../../public/logo.png'
import logoWhite from '../../../../../public/logo-white.png'
import { useTheme } from "next-themes";
import { ChevronLeft, ChevronRight } from "lucide-react";


interface categoriesProps {
  categories: Category[]
}

export interface MenuCategory {
  id: string
  name: string
}

interface ProductPagined {
  first: number,
  prev: number | null,
  next: number,
  last: number
  pages: number
  items: number
  data: Product[]
}



const categoriesCategories = ({ categories }: categoriesProps) => {

  const { selectedStore } = useSelectStore()
  const { companyStore } = useCompanytStore()

  const categoryDefault = {
    id: 0,
    name: 'Ofertas',
    code: ''
  }


  const [selectedCategory, setSelectedCategory] =
    useState<Category>(categoryDefault);

  const { productsInCart, total, toggleCart, totalQuantity } = useCart()

  const handleCategoryClick = (category: Category) => {
    setFilter('')
    setSelectedCategory(category);
  };

  const getCategoryButtonVariant = (category: Category) => {
    return selectedCategory.name === category.name ? "default" : "secondary";
  };
  const [filter, setFilter] = useState('')

  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['products', selectedCategory?.id, filter, String(page), filter],
    queryFn: (): Promise<ProductPagined> => fetchProductsByCategory(selectedCategory?.id),

  });


  const fetchProductsByCategory = async (category: number) => {
    const categoryFitler = filter !== '' ? '' : `&categoryId=${category}`
    const { data } = await api.get(`/api/ecommerce/products/list/?storeId=${selectedStore?.id}${categoryFitler}&pageNumber=${page}&searchParam=${filter}`);
    return data ?? []
  }

  const { theme } = useTheme()

  const logo = theme === 'dark' ? logoWhite : logoInfarma

  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }


  return (
    <div className="relative z-50 mt-[-1.5rem] rounded-t-3xl bg-background">
      <div className="p-5">
        <div className="flex items-center gap-3">
          {companyStore && <Image
            src={companyStore?.mediaPath ? normalizeImage(companyStore?.mediaPath, companyStore?.id) : logo}
            alt={companyStore.name}
            height={45}
            width={45}
            unoptimized
          />}

          <div>
            <h2 className="text-lg font-semibold">{selectedStore?.name}</h2>
            <p className="text-xs opacity-55">{selectedStore?.fantasy}</p>
          </div>
        </div>
      </div>
      <div
        className="flex w-full space-x-4 p-4 pt-0"
      >

        <DebouncedInput
          value={filter ?? ""}
          onChange={(value) => setFilter(String(value))}
          className="w-full flex border-slate-400 border-2 "
          placeholder="Pesquisar produtos..."
        />
      </div>
      <div className="relative">
        <div className="hidden ml-4 md:flex md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 md:z-10 mr-4">
          <Button variant="ghost" className="bg-blue-400 hover:bg-blue-400 opacity-40 hover:opacity-80" onClick={scrollLeft} size="icon">
            <ChevronLeft color="white" />
          </Button>
        </div>

        <div className="hidden mr-4 md:flex md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 md:z-10">
          <Button variant="ghost" className=" bg-blue-400 hover:bg-blue-400 opacity-40 hover:opacity-80" onClick={scrollRight} size="icon">
            <ChevronRight color="white" />
          </Button>
        </div>

        <div
          ref={scrollRef}
          className="w-full overflow-x-auto whitespace-nowrap  scroll-smooth px-10 py-4 [&::-webkit-scrollbar]:hidden"
        >
          <Button
            onClick={() => handleCategoryClick(categoryDefault)}
            variant={getCategoryButtonVariant(categoryDefault)}
            size="sm"
            className="rounded-full mx-0.5"
          >
            OFERTA
          </Button>
          {categories.map((category) => (
            <Button
              onClick={() => handleCategoryClick(category)}
              key={category.name}
              variant={getCategoryButtonVariant(category)}
              size="sm"
              className="rounded-full mx-0.5"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      {/* <div className="relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <Button variant="ghost" onClick={scrollLeft} size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <Button variant="ghost" onClick={scrollRight} size="icon">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <ScrollArea className="w-full whitespace-nowrap overflow-x-auto">
          <div ref={scrollRef} className="flex space-x-4 px-10 py-4">
            <Button
              onClick={() => handleCategoryClick(categoryDefault)}
              variant={getCategoryButtonVariant(categoryDefault)}
              size="sm"
              className="rounded-full "
            >
              OFERTA
            </Button>
            {categories.map((category) => (
              <Button
                onClick={() => handleCategoryClick(category)}
                key={category.name}
                variant={getCategoryButtonVariant(category)}
                size="sm"
                className="rounded-full "
              >
                {category.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div> */}


      <h3 className="px-5 pt-2 font-semibold">{selectedCategory?.name}</h3>
      {data !== undefined && <Products products={data.data} />}


      {data !== undefined &&
        <div className="py-4">
          <PaginationComponent onPageChange={setPage} currentPage={page} totalPages={data.pages} />
        </div>
      }
      {productsInCart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 flex w-full items-center justify-between border-t bg-primary-foreground px-5 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Total dos pedidos</p>
            <p className="text-sm font-semibold">
              {formatCurrency(total)}
              <span className="text-xs font-normal text-muted-foreground">
                / {totalQuantity} {totalQuantity > 1 ? "itens" : "item"}
              </span>
            </p>
          </div>
          <Button onClick={toggleCart}>Ver sacola</Button>
        </div>
      )}
    </div>
  );
};

export default categoriesCategories;
