
"use client";

import { Button } from "@/components/ui/button"
import { useContactStore } from "@/data/store/useContactStore"
import { api } from "@/lib/api"
import { formatCurrency } from "@/helpers/helpers";
import { useStepStore } from "@/data/store/useStepStore";
import { useCart } from "@/data/context/useCart";
import { useOrderStore } from "@/data/store/useOrderStore";
import { useSelectStore } from "@/components/select/useSelectStore";
import { useToast } from "@/hooks/use-toast";
import { OrderCreate } from "@/data/store/interfaces/orders";
import { useEffect, useMemo } from "react";
import PaymentMethodDisplay from "@/components/payment-method-display";

export const FinishCheckout = () => {


    const { order } = useOrderStore()
    const { toast } = useToast()

    const { setStepStore } = useStepStore()
    const { selectedStore } = useSelectStore()
    const { contactStore } = useContactStore()

    const { productsInCart, total, clearCart, toggleCart } = useCart();


    const submitOrder = async () => {


        const productWithPrice = productsInCart.map((product) => ({
            productId: product.id,
            amount: Number(product.quantity),
            unitary: Number(product.price),
            unitaryGross: Number(product.fullPrice),
            discount: Number((product.fullPrice - product.price).toFixed(2)),
            total: Number(product.quantity * product.price),
        }))


        const method: any = order.paymentMethod
        const freight = order.paymentMethod?.freight ?? 0
        const increase = 0
        const discount = 0
        const calcTotal = Number(total + freight + increase - discount).toFixed(2)
        delete method.name
        const formSend: OrderCreate = {
            channel: "ECOMMERCE",
            typeRoute: order.deliveryMethod === 'RECEIVE_AT_HOME' ? 'ENTREGA' : 'RETIRADA',
            freight,
            discount,
            increase,
            subTotal: total,
            total: Number(calcTotal),
            contactAddressId: order.contactAddressId!.id,
            payments: {
                prepaid: 0,
                pending: total,
                methods: [
                    method
                ]
            },
            userId: null,
            paymentId: order.paymentMethod!.id,
            contactId: contactStore.id,
            storeId: Number(selectedStore!.id),
            orderItems: productWithPrice,
        }


        api.post('/api/ecommerce/orders', formSend).then(res => {
            toast({
                title: 'Pedido realizado com sucesso!',
                description: 'Você pode acompanhar seu pedido na tela de Meus Pedidos',
                variant: 'success'
            })
            clearCart()
            toggleCart()
            setStepStore('6')

        }).catch(err => {
            console.log('err', err)
            toast({
                title: 'Error',
                description: 'Não foi possível criar o pedido',
                variant: 'destructive'
            })
        });
    }

    const totalOrder = useMemo(() => {
        if (order.paymentMethod?.freight) {
            return total + order.paymentMethod?.freight
        }
        return total
    }, [order])


    return (
        <div>
            <span>Resumo do pedido</span>
            <div className="flex flex-col border rounded-md p-1">
                <div className="flex justify-between font-bold" >
                    <span className="text-sm"> Descrição</span>
                    <div>
                        <span className="text-sm">Preço x Qtd </span>
                    </div>
                </div>
                {productsInCart.map(item => {
                    return <div className="flex justify-between" key={item.id}>
                        <span className="text-sm"> {item.name}</span>
                        <div>
                            <span className="text-sm">{formatCurrency(item.price)} x {item.quantity} </span>
                        </div>
                    </div>
                })}
            </div>
            <div className="w-full flex justify-end gap-1 my-1 text-sm">
                SubTotal: <span className="font-bold ">{formatCurrency(total)}</span>
            </div>
            <div className="w-full flex justify-end gap-1 my-1 text-sm">
                Frete: <span className="font-bold ">{formatCurrency(order.paymentMethod?.freight ?? 0)}</span>
            </div>
            <div className="w-full flex justify-end gap-1 my-1 text-sm">
                Total: <span className="font-bold">{formatCurrency(totalOrder)}</span>
            </div>
            <section className="flex flex-col ">

                <div className="flex  gap-2 ">
                    Forma de Entrega:
                    <span className="font-bold px-1">
                        {order.deliveryMethod === 'RECEIVE_AT_HOME' ? 'Entrega' : 'Retirar'}
                    </span>

                </div >
                {order.deliveryMethod === 'RECEIVE_AT_HOME' &&
                    <div className="flex flex-col  items-start overflow-hidden">
                        <span>
                            Endereço:
                        </span>
                        <span className="text-sm text-ellipsis flex">
                            {order.contactAddressId?.name}
                        </span >
                    </div>
                }

                <div className="flex gap-2 ">
                    Pagamento:
                    <span className="font-semibold">
                        <PaymentMethodDisplay method={order?.paymentMethod?.name ?? ''} /> {order.paymentMethod!.installments > 1 && `  em ${order.paymentMethod?.installments}x`}
                    </span>
                </div>
                {order.paymentMethod?.changeFor !== 0 && <div className="flex gap-2 ">
                    <span className="text-md">
                        {`Troco para: ${formatCurrency(order.paymentMethod!.changeFor)}`}
                    </span>
                </div>}

            </section>
            <div className="flex flex-col justify-center my-4">

                <Button
                    type="button"
                    onClick={() => submitOrder()}
                >
                    Finalizar
                </Button>
                <Button
                    type="button"
                    variant='link'
                    onClick={() => setStepStore('3')}
                >
                    Voltar
                </Button>
            </div>
        </div >
    );
}