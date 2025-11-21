'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/helpers/helpers";

import CartProductItem from "./cart-product-item";
import { useCart } from "@/data/context/useCart";
import { useStepStore } from "@/data/store/useStepStore";

const CartSheet = () => {

  const { isOpen, toggleCart, productsInCart, total, totalFull, toggleFinishOrder } = useCart();

  const { setStepStore } = useStepStore()

  const handleClickButtonFinishOrder = () => {
    setStepStore('1')
    toggleFinishOrder()
  }
  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-[80%] border-white">
        <SheetHeader>
          <SheetTitle className="text-left">Sacola</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col py-5">
          <div className="flex flex-col space-y-2 overflow-y-scroll">
            {productsInCart.map((product) => (
              <CartProductItem key={product.id} product={product} />
            ))}
          </div>
          <Card className="my-6 mt-auto">
            <CardContent className="p-5 flex flex-col space-y-2 ">
              <div className="flex justify-between border-b">
                <p className="text-sm text-muted-foreground">SubTotal</p>
                <p className="text-sm font-semibold">{formatCurrency(totalFull)}</p>
              </div>
              <div className="flex justify-between border-b">
                <p className="text-sm text-muted-foreground">Descontos</p>
                <p className="text-sm font-semibold">{formatCurrency(totalFull - total)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-sm font-semibold">{formatCurrency(total)}</p>
              </div>
            </CardContent>
          </Card>
          <Button
            className="w-full rounded-full disabled:cursor-not-allowed"
            onClick={() => handleClickButtonFinishOrder()}
            disabled={productsInCart.length === 0}
          >
            Finalizar pedido
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;


