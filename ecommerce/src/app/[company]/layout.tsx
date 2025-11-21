'use client'
import { useCart } from "@/data/context/useCart";
import CartSheet from "./menu/components/cart-sheet";
import FinishOrderDialog from "./menu/components/finish-order-dialog";


export default function SlugLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const { finishOrderDialogIsOpen, toggleFinishOrder } = useCart()


    return <div
        className="flex w-full justify-center"
    >
        <CartSheet />
        <FinishOrderDialog
            open={finishOrderDialogIsOpen}
            onOpenChange={toggleFinishOrder}
        />
        <div className=" bg-background pb-2 w-full max-w-7xl">{children}</div>
    </div>
}
