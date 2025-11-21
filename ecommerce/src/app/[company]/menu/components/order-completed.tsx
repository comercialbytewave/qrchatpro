"use client";

import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { CheckCheck } from "lucide-react";
import { useCart } from "@/data/context/useCart";
import { useStepStore } from "@/data/store/useStepStore";

type Props = {
    id: string | null
}

export const OrderCompleted = ({ id }: Props) => {

    const { company } = useParams<{ company: string }>();

    const { toggleFinishOrder } = useCart()

    const { setStepStore } = useStepStore()

    const router = useRouter()

    const handleInitClick = () => {
        setStepStore('1')
        toggleFinishOrder()
    }

    const handleOrdersClick = (event: React.MouseEvent) => {
        event.preventDefault()
        setStepStore('1')
        toggleFinishOrder()
        router.replace(`/${company}/orders?id=${id}`)
    }


    return (
        <div className="flex justify-center w-full flex-col">
            <div className="flex justify-center">
                <CheckCheck size={120} className="text-primary p-1 rounded-full" />
            </div>
            <div
                className="flex justify-center"
            >
                <span
                    className="font-bold text-primary underline"
                >Pedido Realizado !</span>
            </div>
            <div
                className="flex w-full justify-around mt-8"
            >
                <Button
                    type="button"
                    variant='link'
                    onClick={() => handleInitClick()}
                >
                    Inicio
                </Button>
                <Button
                    type="button"
                    variant='default'
                    onClick={(e) => handleOrdersClick(e)}
                >
                    Meus Pedidos
                </Button>
            </div>
        </div>
    );
}
