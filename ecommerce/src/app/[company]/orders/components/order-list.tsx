"use client";


import { ChevronLeftIcon, ScrollTextIcon, Store, Truck, User } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, normalizeImage } from "@/helpers/helpers";
import { useRouter, useSearchParams } from "next/navigation";
import { OrderData, OrderItem } from "@/data/store/interfaces/orders";
import { useCompanytStore } from "@/data/store/useCompanyStore";
import whatsapp from '../../../../../public/whatsapp.png'
import ecommerce from '../../../../../public/ecommerce.png'
import { useContactStore } from "@/data/store/useContactStore";
import { useEffect, useMemo } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

interface Props {
  orders: OrderData[]
}

const OrderList = ({ orders }: Props) => {

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id')
  const idParams = id !== undefined ? `?id=${id}` : ''
  const { companyStore } = useCompanytStore()

  const { contactStore } = useContactStore()

  const handleBackClick = () => {
    router.replace(`/${companyStore?.slug}/menu${idParams}`)
  }

  const isIdentified = useMemo(() => {
    if (id !== null && contactStore !== undefined) {
      return true
    }
    return false
  }, [id, contactStore])

  return (
    <div className="space-y-6 p-6">
      <div className="flex w-full justify-between">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full"
          onClick={handleBackClick}
        >
          <ChevronLeftIcon />
        </Button>
        {isIdentified && <div
          className="flex items-center gap-2"
        >
          <span>
            {contactStore?.name}
          </span>
          <Avatar>
            <AvatarImage className="bg-secondary-foreground" src="" alt="user" />
            <AvatarFallback className="bg-secondary-foreground"><User className="text-primary-foreground" /></AvatarFallback>
          </Avatar>
        </div>
        }
      </div>
      <div className="flex items-center gap-3">
        <ScrollTextIcon />
        <h2 className="text-lg font-semibold">Meus Pedidos</h2>
      </div>
      {
        orders !== undefined && orders.length === 0 ? <div>
          Não existem pedidos
        </div> : orders.map((order: OrderData) => (
          <Card key={order.id}>
            <CardContent className="space-y-4 p-5">
              <div
                className={`flex  w-full  justify-between rounded-full px-2 py-1 text-xs font-semibold`}
              >
                <div>
                  <span
                    style={{ backgroundColor: order.status.color ?? '#b5bcc7' }}
                    className={`p-2 rounded-lg text-white`}
                  >
                    {order.status.name}
                  </span>
                </div>
                <div className=" flex items-center gap-2">
                  <span>

                    {order.typeRoute === 'ENTREGA' ? 'ENTREGA' : 'RETIRADA'}
                  </span>
                  {order.typeRoute === 'ENTREGA' ? <Truck /> : <Store />}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative h-5 w-5">
                  {companyStore && <Image
                    src={normalizeImage(companyStore.mediaPath, companyStore.id)}
                    alt={companyStore?.name ?? ''}
                    className="rounded-sm"
                    fill
                    unoptimized
                  />}
                </div>
                <p className="text-sm font-semibold">{companyStore?.name}</p>
                <div
                  className="ml-auto"
                >
                  <div className="text-xs flex items-center gap-2">{order.channel} {order.channel === 'whatsapp' ? <Image width={16} height={16} src={whatsapp} alt="logo-whatsapp" /> : <Image width={16} height={16} src={ecommerce} alt="logo-eccomerce" />}</div>
                </div>
              </div>

              <Separator />
              <div className="space-y-2">
                {order.orderItems.map((orderProduct: OrderItem) => (
                  <div key={orderProduct.id} className="flex items-center gap-2 ">
                    <p className="text-sm w-20 text-nowrap">{Number(orderProduct.amount).toFixed(0)} x {formatCurrency(Number(orderProduct.unitary))} </p>
                    <p className="text-sm  ">{orderProduct.product.name}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex flex-col">
                <p className="font-medium">Total: <b>{formatCurrency(Number(order.total))} </b></p>

                <p>
                  <b> {order.payments.methods[0].name}  </b> {order.payments.methods[0].type === 'CC' && `em ${order.payments.methods[0].installments}x`}
                </p>
              </div>
              {order.typeRoute === 'ENTREGA' ? <div>
                <span>
                  Endereço
                </span>
                <p className="text-sm">{`${order.address.address}, ${order.address.number},  ${order.address.neighborhood} -  ${order.address.city} -  ${order.address.state}`}</p>
              </div>
                :
                <div>
                  <p>
                    Retirar na Loja:
                  </p>
                  <p className="font-bold">
                    {order.store.name}
                  </p>
                  <p className="text-sm">{`${order.store.address}, ${order.store.number},  ${order.store.neighborhood} -  ${order.store.city} -  ${order.store.state}`}</p>
                </div>
              }

            </CardContent>
          </Card>
        ))
      }
    </div >
  )
};

export default OrderList;
