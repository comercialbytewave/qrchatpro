'use client'
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useStepStore } from "@/data/store/useStepStore";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Payment } from "@/data/store/interfaces/payment-method";
import { useQuery } from "@tanstack/react-query";
import { useOrderStore } from "@/data/store/useOrderStore";
import { NumericFormat } from 'react-number-format';
import { Input } from "@/components/ui/input";
import { useCart } from "@/data/context/useCart";
import { formatCurrency } from "@/helpers/helpers";
import { DeliveryFee } from "@/data/store/interfaces/fee";
import { useSelectStore } from "@/components/select/useSelectStore";

const addressSchema = z.object({
    method: z.string().min(1, "O CEP é obrigatório"),
    change: z.boolean(),
    amount: z.string().optional(),
    installments: z.string().optional(),
});

function encontrarTaxaAplicavel(valorDeVenda: number, taxas: DeliveryFee[]): number {
    const taxasAplicaveis = taxas
        .map(taxa => ({ ...taxa, saleValue: parseFloat(taxa.saleValue) }))
        .filter(taxa => taxa.saleValue <= valorDeVenda);

    if (taxasAplicaveis.length === 0) return 0;

    const melhorTaxa = taxasAplicaveis.reduce((maior, atual) =>
        atual.saleValue > maior.saleValue ? atual : maior
    );

    return parseFloat(melhorTaxa.deliveryFee);
}


type Address = z.infer<typeof addressSchema>;

const PaymentMethodSelector = () => {

    const { setStepStore } = useStepStore()
    const { updateOrderField } = useOrderStore()
    const { selectedStore } = useSelectStore()
    const { total } = useCart()

    const [deliveryFee, setDeliveryFee] = useState<number>(0)


    const { data } = useQuery({
        queryKey: ['paymensts'],
        queryFn: (): Promise<Payment[]> => fetchPaymentMethodAvailables(),

    });

    const fetchPaymentMethodAvailables = async () => {
        const response = await api.get(`/api/ecommerce/payments/list`);
        return response.data ?? []
    }

    const form = useForm<Address>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            method: "",
            change: false,
            amount: "",
        },
    });


    const handleNext = () => {
        const methodPayment = data!.find(method => String(method.id) === form.watch('method'))
        if (methodPayment) {
            let formSend = {
                id: methodPayment.id,
                name: methodPayment.name,
                value: total,
                changeFor: 0,
                installments: 1,
                freight: deliveryFee
            }
            if (methodPayment?.typePayment.code === "DH") {
                formSend.installments = 1
                if (form.watch('change') === true) {
                    formSend.changeFor = Number(form.watch('amount'))
                }
            } else {
                formSend.changeFor = 0
                if (methodPayment?.typePayment.code === "CC") {
                    formSend.installments = Number(form.watch('installments'))
                }

            }
            updateOrderField('paymentMethod', formSend)
            setStepStore('5')
        }
    }

    const paymentMethodSelected = useMemo(() => {
        if (data) {
            return data.find(item => item.id === Number(form.watch('method')))
        } return undefined
    }, [form.watch('method')])

    const disabledButtonNext = useMemo(() => {
        if (paymentMethodSelected) {
            // CASO ESCOLHA DINHEIRO 
            if (paymentMethodSelected.typePayment.code === "DH") {
                // CASO ESCOLHA DINHEIRO E NÃO PRECISE DE TROCO HABILITA O BOTAO 
                if (form.watch('change') === false) return false
                // CASO ESCOLHA DINHEIRO E PRECISE DE TROCO
                else if (form.watch('change') === true) {
                    // CASO ESCOLHA DINHEIRO E PRECISE DE TROCO, MAS NÃO INFORMOU O VALOR PARA QUAL PRECISA DE TROCO
                    if (form.watch('amount') === '') {
                        return true
                    }
                    else if (Number(form.watch('amount')) < (total + deliveryFee)) {
                        return true
                    }
                    return false
                }
                return true
            }
            else if (paymentMethodSelected.typePayment.code === "CC") {
                if (form.watch('installments') !== undefined) {
                    return false
                }
                return true
            }
            // CASO SELECIONE PIX OU CARTAO DE DEBITO O BOTAO É HABILITADO
            return false
        } return true
    }, [paymentMethodSelected, form.watch('change'), form.watch('amount'), form.watch('installments')])


    const fetchDeliveryFeeByStore = async () => {
        const response = await api.get(`/api/ecommerce/delivery-fee/list?storeId=${selectedStore?.id}`);
        const deliveryFeeAvailable = response.data
        const deliveryFeeCurrent = encontrarTaxaAplicavel(total, deliveryFeeAvailable)
        setDeliveryFee(deliveryFeeCurrent)
    }

    useEffect(() => {
        fetchDeliveryFeeByStore()
    }, [total])

    return (
        <div className="max-w-md">
            <div
                className="flex flex-col gap-2 justify-between my-1"
            >
                <div className="w-full flex-col flex gap-1 items-end justify-center">
                    <span className="text-sm">
                        Subtotal: <b> {formatCurrency(total)}</b>
                    </span>
                    <span className="text-sm">
                        Frete: <b> {formatCurrency(deliveryFee)}</b>
                    </span>
                    <span className="text-sm">
                        Total: <b> {formatCurrency(total + deliveryFee)}</b>
                    </span>

                </div>

                <Form {...form}>
                    <form className="space-y-3">

                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Forma de Pagamento</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {data && data.map(item => {
                                                return (
                                                    <SelectItem key={item.id + item.name} value={String(item.id)}>
                                                        {item.name}
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {paymentMethodSelected !== undefined && paymentMethodSelected.typePayment.change === true &&
                            <>
                                <FormField
                                    control={form.control}
                                    name="change"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Precisa de troco?</FormLabel>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {form.watch('change') === true &&
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Troco para quanto?</FormLabel>
                                                <FormControl>
                                                    <NumericFormat
                                                        placeholder="R$ 0,00"
                                                        customInput={Input}
                                                        thousandSeparator="."
                                                        decimalSeparator=","
                                                        prefix="R$ "
                                                        allowNegative={false}
                                                        decimalScale={2}
                                                        fixedDecimalScale
                                                        value={field.value ?? ""}
                                                        onValueChange={(values) => {
                                                            field.onChange(values.value);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                }
                            </>

                        }
                        {paymentMethodSelected?.typePayment.code == 'CC' && <FormField
                            control={form.control}
                            name="installments"
                            render={({ field }) => {
                                const availableInstallments = paymentMethodSelected.paymentDetails.filter(detail => Number(total + deliveryFee) >= Number(detail.minimumValue))
                                    .sort((a, b) => a.installments - b.installments);

                                return (
                                    <FormItem>
                                        <FormLabel>Parcelamento</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o número de parcelas" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>

                                                {availableInstallments?.map(detail => {
                                                    return <SelectItem key={detail.id} value={String(detail.installments)}>
                                                        {detail.installments}x de R$ {(Number(total + deliveryFee) / detail.installments).toFixed(2).replace('.', ',')}
                                                    </SelectItem>
                                                }
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />}

                        <Button type="button" disabled={disabledButtonNext} onClick={() => handleNext()} className="w-full">Avançar</Button>
                        <Button type="button" variant='outline' onClick={() => setStepStore('3')} className="w-full">Votlar</Button>

                    </form>
                </Form>
            </div>
        </div >
    );
};

export default PaymentMethodSelector;
