"use client";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { ReactNode } from "react"
import { InputSelectStores } from "./select/select"
import { useSelectStore } from "./select/useSelectStore"
import { useRouter, useSearchParams } from "next/navigation"
import { useCompanytStore } from "@/data/store/useCompanyStore";
import { useOrderStore } from "@/data/store/useOrderStore";
import { useCart } from "@/data/context/useCart";

interface Props {
    method: string
    children: ReactNode
}

export function DialogSelectStore({ children, method }: Props) {

    const { selectedStore } = useSelectStore();
    const { companyStore } = useCompanytStore()
    const { clearCart } = useCart()
    const router = useRouter()

    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const paramsid = id ? `id=${id}` : ''
    const { updateOrderField } = useOrderStore()

    const handleRedirect = () => {
        clearCart()
        updateOrderField('deliveryMethod', method)
        router.push(`/${companyStore?.slug}/menu?${paramsid}`)
    }

    return (
        <Dialog>
            <DialogTrigger >
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-white">
                <DialogHeader>
                    <DialogTitle>Selecione uma loja</DialogTitle>
                    <DialogDescription>
                        Selecione uma loja de sua preferência
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <InputSelectStores />
                </div>
                <DialogFooter
                >
                    <Button
                        onClick={() => handleRedirect()}
                        className="disabled:cursor-not-allowed"
                        disabled={selectedStore === undefined}
                        type="button">Avançar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
