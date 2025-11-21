import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import {
    DrawerFooter,
} from "@/components/ui/drawer";

import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useContactStore } from "@/data/store/useContactStore";
import { useStepStore } from "@/data/store/useStepStore";
import { isValidCpf, removeCpfPunctuation, removerMascaraTelefone } from "@/helpers/helpers";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"



const formSchema = z.object({
    document: z
        .string()
        .trim()
        .min(1, {
            message: "O CPF é obrigatório.",
        })
        .refine((value) => isValidCpf(value), {
            message: "CPF inválido.",
        }),
    phone: z
        .string()
        .trim()
        .min(10, { message: "O telefone deve ter pelo menos 10 dígitos." })
        .max(15, { message: "O telefone não pode ter mais de 15 dígitos." }),
});

type FormSchema = z.infer<typeof formSchema>;
type Props = {
    id: string | null;
}
export const FormIdentification = ({ id }: Props) => {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false);


    const router = useRouter();

    const { setContactStore, setIsEdit } = useContactStore();
    const { setStepStore } = useStepStore();

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
        shouldUnregister: true,
    });

    const getContactById = async (contactId: string) => {
        await api.get(`/api/ecommerce/contacts?id=${contactId}`).then(res => {
            setContactStore(res.data)
            setStepStore('3')
            setIsEdit(true)
        }).catch(err => {
            console.log('err', err)
            const newUrl = new URL(window.location.href).toString().split('?')[0];
            router.replace(newUrl.toString());
        })
    }

    const onSubmit = async (formData: FormSchema) => {
        const documentFormated = removeCpfPunctuation(formData.document)
        const phoneFormated = removerMascaraTelefone(formData.phone)
        try {
            setIsLoading(true);
            await api.get(`/api/ecommerce/contacts/${documentFormated}/${phoneFormated}`).then(res => {
                const id = res.data.idCrypto
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set("id", id);
                router.replace(newUrl.toString());
                setContactStore(res.data)
                setStepStore('3')
                setIsEdit(true)

            }).catch(err => {
                if (err.response.data.error === 'Cliente não cadastrado') {
                    setContactStore({ number: phoneFormated, document: documentFormated })
                    setStepStore('2')
                    setIsEdit(false)
                } else if (err.response.data.statusCode === 409) {
                    toast({
                        title: 'Erro',
                        description: err.response.data.error,
                        variant: 'warning'
                    })
                }
                return
            })
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        if (id) {
            getContactById(id)
        }
    }, [id])


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Seu CPF</FormLabel>
                            <FormControl>
                                <PatternFormat
                                    placeholder="Digite seu CPF..."
                                    format="###.###.###-##"
                                    customInput={Input}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem
                        >
                            <FormLabel>Número deWhatsapp </FormLabel>
                            <FormControl>
                                <PatternFormat
                                    placeholder="Digite seu telefone..."
                                    format="(##) #####-####"
                                    customInput={Input}

                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DrawerFooter>
                    <Button
                        type="submit"
                        variant="default"
                        className="rounded-full"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2Icon className="animate-spin" />}
                        Avançar
                    </Button>
                </DrawerFooter>
            </form>
        </Form >
    );
}