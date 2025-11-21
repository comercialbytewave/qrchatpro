'use client'
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Home, Pencil, Plus, Store } from "lucide-react";
import { useContactStore } from "@/data/store/useContactStore";
import { useStepStore } from "@/data/store/useStepStore";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brazilianStates } from "@/helpers/helpers";
import { useCompanytStore } from "@/data/store/useCompanyStore";
import { useOrderStore } from "@/data/store/useOrderStore";
import { useToast } from "@/hooks/use-toast";
import { SimpleLoading } from "@/components/loading-component";

const addressSchema = z.object({
    id: z.any().optional(),
    zipCode: z.string().min(1, "O CEP é obrigatório"),
    address: z.string().min(1, "O endereço é obrigatório"),
    number: z.string().min(1, "O número é obrigatório"),
    complement: z.string().optional(),
    state: z.string().min(1, "O estado é obrigatório"),
    city: z.string().min(1, "A cidade é obrigatória"),
    neighborhood: z.string().min(1, "O bairro é obrigatório"),
    isActive: z.boolean().optional(),
});

interface AddressProps {
    cep: string
    state: string
    city: string
    neighborhood: string
    street: string
    service: string
    location: {
        type: string
        coordinates: any
    }
}


type Address = z.infer<typeof addressSchema>;

const AddressSelector = () => {

    const { contactStore } = useContactStore()


    const { setStepStore } = useStepStore()

    const [addresses, setAddresses] = useState<Address[]>(contactStore.addresses || []);
    const [loadingZipCode, setLoadingZipCode] = useState(false)

    const { companyStore } = useCompanytStore()

    const { toast } = useToast()

    const { updateOrderField, order } = useOrderStore()

    const [selectedAddress, setSelectedAddress] = useState<string | null>(addresses.find((a) => a.isActive)?.id || null);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<Address>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            zipCode: "",
            address: "",
            number: "",
            complement: "",
            state: "",
            city: "",
            neighborhood: "",
            isActive: true,
        },
    });

    const openEditModal = (address?: Address) => {
        if (address) {
            form.reset(address
            );
        } else {
            form.reset({
                zipCode: "",
                address: "",
                number: "",
                complement: "",
                state: "",
                city: "",
                neighborhood: "",
                isActive: false,
            });
        }
        setEditingAddress(address || null);
        setIsDialogOpen(true);
    };

    const listAddresByContact = async () => {
        await api.get(`/api/ecommerce/addresses/list/${contactStore.id}`).then(res => {
            setAddresses(res.data)
            if (res.data.length > 0) {
                setSelectedAddress(res.data[0].id)
            }
        }).catch(err => {
            console.log(err)
        })
    }

    function limparCEP(cep: string) {
        if (cep) {
            return cep.replace(/\D/g, '');
        }
        return ''
    }

    const handleSaveAddress = async (data: Address) => {

        const formSend: any = data
        formSend.companyId = companyStore?.id
        formSend.contactId = contactStore.id
        formSend.type = 'CASA'
        formSend.longitude = ''
        formSend.latitude = ''
        formSend.zipCode = limparCEP(formSend.zipCode)

        if (editingAddress) {
            const idAddressEdit = formSend.id
            delete formSend.id
            await api.put(`/api/ecommerce/addresses/${idAddressEdit}`, formSend).then(async () => {
                await listAddresByContact()
                toast({
                    title: 'Sucesso',
                    description: `Endereço cadastrado com sucesso`,
                    variant: 'success'
                })
                setIsDialogOpen(false);
            }).catch(err => {
                console.log(err)
                toast({
                    title: 'Erro',
                    description: `${err?.response?.data?.error}`,
                    variant: 'destructive'
                })
            })
        } else {
            await api.post('/api/ecommerce/addresses', formSend).then(async (res) => {
                setSelectedAddress(res.data.id)
                await listAddresByContact()
                toast({
                    title: 'Sucesso',
                    description: `Endereço atualizado com sucesso`,
                    variant: 'success'
                })
                setIsDialogOpen(false);
            }).catch((err: any) => {
                console.log(err)
                toast({
                    title: 'Erro',
                    description: `${err?.response?.data?.error}`,
                    variant: 'destructive'
                })
            })
        }
        // setIsDialogOpen(false);
    };

    const handleNext = () => {
        updateOrderField('deliveryMethod', order.deliveryMethod)
        if (order.deliveryMethod === 'COLLECT_AT_PHARMACY') {
            const addressDefault = addresses.find(item => item.isActive === true)
            if (addressDefault) {
                updateOrderField('contactAddressId', {
                    id: addressDefault!.id,
                    name: `${addressDefault!.address}, ${addressDefault!.number} - ${addressDefault!.neighborhood} - ${addressDefault!.city} `
                })
            } else {
                updateOrderField('contactAddressId', {
                    id: null,
                    name: ` `
                })
            }
        } else {
            const addressSelected = addresses.find(item => item.id === selectedAddress)
            updateOrderField('contactAddressId', {
                id: addressSelected!.id,
                name: `${addressSelected!.address}, ${addressSelected!.number} - ${addressSelected!.neighborhood} -  ${addressSelected!.city}`
            })
        }
        setStepStore('4')
    }

    useEffect(() => {
        if (order.deliveryMethod === 'RECEIVE_AT_HOME') {
            listAddresByContact()
        }
    }, [order.deliveryMethod])

    const disabledNextButton = useMemo(() => {
        if (order.deliveryMethod == 'RECEIVE_AT_HOME' && addresses.length === 0) {
            return true
        }
        return false
    }, [order, addresses])


    useEffect(() => {
        const zipCode = form.watch('zipCode')
        const getAddresByZipCode = async (zipCode: string) => {
            setLoadingZipCode(true)
            try {
                const responsse = await fetch(`https://brasilapi.com.br/api/cep/v2/${zipCode}`)
                const addresByZipCoode: AddressProps = await responsse.json()
                addresByZipCoode.street && form.setValue('address', addresByZipCoode.street ?? '')
                addresByZipCoode.neighborhood && form.setValue('neighborhood', addresByZipCoode.neighborhood ?? '')
                addresByZipCoode.city && form.setValue('city', addresByZipCoode.city ?? '')
                addresByZipCoode.state && form.setValue('state', addresByZipCoode.state ?? '')
                setLoadingZipCode(false)
            } catch (error) {
                console.log('err', error)
                form.setValue('address', '')
                form.setValue('neighborhood', '')
                form.setValue('city', '')
                form.setValue('state', '')
                setLoadingZipCode(false)

            }
        }
        if (zipCode.length === 8) {
            getAddresByZipCode(zipCode)
        }
    }, [form.watch('zipCode')])

    return (
        <div className="max-w-md">

            <RadioGroup value={order.deliveryMethod || ""} onValueChange={e => updateOrderField('deliveryMethod', e)} className="space-y-2 mb-4">
                <div className="flex items-center justify-between gap-2  rounded-lg">
                    <RadioGroupItem value='COLLECT_AT_PHARMACY' id={`method_COLLECT_AT_PHARMACY`} />
                    <label htmlFor={`method_COLLECT_AT_PHARMACY`} className="flex-1 cursor-pointer flex items-center gap-2">
                        <Store size={16} />  <p className="font-semibold">Retirar</p>
                    </label>
                </div>
                <div className="flex items-center justify-between gap-2  rounded-lg">
                    <RadioGroupItem value='RECEIVE_AT_HOME' id={`method_RECEIVE_AT_HOME`} />
                    <label htmlFor={`method_RECEIVE_AT_HOME`} className="flex-1 cursor-pointer flex items-center  gap-2">
                        <Home size={16} />   <p className="font-semibold">Entrega</p>
                    </label>
                </div>
            </RadioGroup>
            {order.deliveryMethod == 'RECEIVE_AT_HOME' &&
                <>
                    <RadioGroup value={selectedAddress || ""} onValueChange={setSelectedAddress} className="space-y-2 my-4">
                        {addresses.map((address) => (
                            <div key={address.id} className="flex items-center justify-between border p-3 rounded-lg">
                                <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                                <label htmlFor={`address-${address.zipCode}`} className="flex-1 ml-2 cursor-pointer">
                                    <p className="font-semibold">{address.address}, {address.number}</p>
                                    <p className="text-sm text-gray-600">{address.city} - {address.state}</p>
                                </label>
                                <Button size="sm" variant='outline' onClick={() => openEditModal(address)}><Pencil /></Button>
                            </div>
                        ))}
                    </RadioGroup>
                    <div
                        className="flex w-full justify-end items-center gap-2"
                    >

                        <Button variant='outline' size='default' className="border  border-primary rounded-md" onClick={() => openEditModal()}>    <span>Adicionar</span>  <Plus className="text-primary" /> </Button>
                    </div>
                </>

            }
            <div
                className="flex flex-col gap-2 justify-between mt-4"
            >
                <Button
                    className="w-full disabled:cursor-not-allowed"
                    type="button"
                    disabled={disabledNextButton}
                    onClick={() => handleNext()}
                >
                    Avançar
                </Button>
                {/* <Button
                    type="button"
                    variant='link'
                    onClick={() => setStepStore('2')}
                >
                    Voltar
                </Button> */}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className="max-w-[400px]"
                >
                    <DialogHeader>
                        <DialogTitle>{editingAddress ? "Editar Endereço" : "Adicionar Endereço"}</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSaveAddress)} className="space-y-3">
                            <FormField control={form.control} name="zipCode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex gap-1">CEP  {loadingZipCode && <SimpleLoading />}</FormLabel>
                                    <FormControl><Input
                                        onKeyPress={event => {
                                            if (!/[0-9]/.test(event.key)) {
                                                event.preventDefault();
                                            }
                                        }}
                                        maxLength={8}
                                        placeholder="Digite o CEP..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Endereço</FormLabel>
                                    <FormControl><Input disabled={loadingZipCode} placeholder="Digite o endereço..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-4 gap-3">
                                <FormField control={form.control} name="number" render={({ field }) => (
                                    <FormItem
                                        className="col-span-1"
                                    >
                                        <FormLabel>Número</FormLabel>
                                        <FormControl><Input disabled={loadingZipCode} placeholder="Nº" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="neighborhood" render={({ field }) => (
                                    <FormItem
                                        className="col-span-3"
                                    >
                                        <FormLabel>Bairro</FormLabel>
                                        <FormControl><Input disabled={loadingZipCode} placeholder="Digite o endereço..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estado</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger
                                                        disabled={loadingZipCode}
                                                    >
                                                        <SelectValue placeholder="UF" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {brazilianStates.map(item => {
                                                        return (
                                                            <SelectItem key={item.value} value={item.value}>
                                                                {item.label}
                                                            </SelectItem>
                                                        )
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cidade</FormLabel>
                                        <FormControl><Input disabled={loadingZipCode} placeholder="Opcional" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="complement" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Complemento</FormLabel>
                                    <FormControl><Input placeholder="Opcional" {...field} /></FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="isActive" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                                        <span className="mx-1">
                                            Tornar endereço principal
                                        </span>
                                    </FormLabel>
                                </FormItem>
                            )} />

                            <Button type="submit" className="w-full">Salvar</Button>
                            <DialogClose
                                asChild
                            >
                                <Button type="button" variant='destructive' className="w-full">Cancelar</Button>
                            </DialogClose>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddressSelector;
