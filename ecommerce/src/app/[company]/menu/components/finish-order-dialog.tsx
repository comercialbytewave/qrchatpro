"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FormIdentification } from "./forms/form-identification";
import { useStepStore } from "@/data/store/useStepStore";
import { useContactStore } from "@/data/store/useContactStore";
import { FormContact } from "./forms/form-contact";
import AddressSelector from "./address-selector";
import { FinishCheckout } from "./finish-checkout";
import { OrderCompleted } from "./order-completed";
import PaymentMethodSelector from "./payment-method-selector";

interface FinishOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FinishOrderDialog = ({ open, onOpenChange }: FinishOrderDialogProps) => {

  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  const { stepStore, setStepStore } = useStepStore()
  const { isEdit } = useContactStore()
  const { contactStore } = useContactStore()

  useEffect(() => {
    setStepStore('1')
  }, [])

  const messageRegsiter = isEdit ? 'Confirme seus dados' : 'Novo Cadastro'

  const ContentDialog = () => {
    switch (stepStore) {
      case "1":
        return <FormIdentification id={id} />
      case "2":
        return <FormContact />
      case "3":
        return <div className="flex flex-col gap-2">
          <span className="text-sm">Olá, <b> {contactStore?.name} </b>!<br/>
            Como deseja receber sua encomenda?
          </span>
          <AddressSelector />
        </div>
      case "4":
        return <div className="flex flex-col gap-2"><span className="text-sm">
          <b> {contactStore?.name}, </b> como  deseja pagar sua compra?
        </span> <PaymentMethodSelector /></div>
      case "5":
        return <div className="flex flex-col gap-2"><span className="text-sm">
          Quase lá, <b> {contactStore?.name}. </b>

        </span>
          <FinishCheckout /> </div>
      case "6":
        return <OrderCompleted id={id} />
      default:
        return <></>
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild> </DialogTrigger>
      <DialogContent className="max-w-[400px] border-white">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>
          <DialogDescription>
            {stepStore === '1' && 'Identifique-se'}
            {stepStore === '2' && messageRegsiter}
            {/* {stepStore === '3' && 'Endereços'} */}
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <ContentDialog />
        </div>
      </DialogContent>
    </Dialog>
  )
}
export default FinishOrderDialog;