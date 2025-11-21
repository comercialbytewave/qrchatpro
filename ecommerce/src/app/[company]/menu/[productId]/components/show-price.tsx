import { Button } from "@/components/ui/button"
import { Product } from "@/data/store/interfaces/product"
import { calcPercentage, formatCurrency } from "@/helpers/helpers"

type Props = {
    product: Product
}
export const HandleShowPrice = ({ product }: Props) => {
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