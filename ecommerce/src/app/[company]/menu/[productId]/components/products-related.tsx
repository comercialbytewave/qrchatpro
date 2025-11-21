import { useSelectStore } from "@/components/select/useSelectStore";
import { normalizeImage } from "@/helpers/helpers";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { HandleShowPrice } from "./show-price";
import nophoto from '../../../../../../public/nophoto.jpg'

type Props = {
    categoryId: string
}
export const ProdctsRelated = ({ categoryId }: Props) => {

    const { selectedStore } = useSelectStore()
    const { company } = useParams<{ company: string }>();
    const searchParams = useSearchParams()
    const id = searchParams.get('id');
    const paramsid = id ? `id=${id}` : ''


    const fetchProductsByCategory = async (categoryId: string) => {
        if (categoryId) {
            const { data } = await api.get(`/api/ecommerce/products/list/?storeId=${selectedStore?.id}&categoryId=${categoryId}&pageNumber=${1}`);
            return data.data ?? []
        } return []
    }


    const { data: productsByCaterogory, } = useQuery({
        queryKey: ['products', categoryId],
        queryFn: () => fetchProductsByCategory(categoryId),
    });



    return (
        <div
            className="flex flex-col w-full px-2 ">
            <h1 className="text-xl font-bold my-2">Produtos Relacionados</h1>
            <div className="flex gap-2 items-center justify-center flex-wrap ">
                {productsByCaterogory && productsByCaterogory.map((product: any) => {
                    return (
                        <div
                            key={product.id}
                            className="flex items-center justify-between col-span-1 flex-col w-44  group border shadow-md rounded-md p-2 "

                        >
                            <Link
                                href={`/${company}/menu/${product.id}?${paramsid}`}
                                className="flex flex-col justify-center items-center  w-44 h-40 relative">
                                <Image
                                    src={product.mediaPath !== "" ? normalizeImage(product.mediaPath, product.companyId) : nophoto}
                                    alt={product.name}
                                    fill
                                    className="rounded-lg object-contain"
                                    unoptimized
                                />
                            </Link>
                            <h3 className="text-sm font-medium text-center truncate w-full border-b-2  mt-2">{product.name}</h3>
                            <div className="w-full flex my-1 h-12">
                                <HandleShowPrice product={product} />
                            </div>

                        </div>
                    )
                })}
            </div>
        </div>
    );
}