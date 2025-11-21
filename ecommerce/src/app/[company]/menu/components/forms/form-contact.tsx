'use client'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { useContactStore } from "@/data/store/useContactStore";
import { useStepStore } from "@/data/store/useStepStore";
import { isValidCpf } from "@/helpers/helpers";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


const formSchema = z.object({
    id: z.number().optional(),
    name: z.string().trim().min(1, { message: "O nome é obrigatório." }),
    document: z
        .string()
        .trim()
        .min(1, { message: "O CPF é obrigatório." })
        .refine((value) => isValidCpf(value), { message: "CPF inválido." }),
    fullname: z.string().trim().min(1, { message: "O nome completo é obrigatório." }),
    number: z
        .string()
        .trim()
        .min(10, { message: "O telefone deve ter pelo menos 10 dígitos." })
        .max(15, { message: "O telefone não pode ter mais de 15 dígitos." }),
    email: z
        .string()
        .trim()
        .email({ message: "E-mail inválido." })
        .min(1, { message: "O e-mail é obrigatório." }),

});

type FormSchema = z.infer<typeof formSchema>;

export const FormContact = () => {

    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const { contactStore, isEdit, setContactStore } = useContactStore();
    const { setStepStore } = useStepStore();

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            document: '',
            fullname: '',
            number: '',
            email: '',
        },
    });

    useEffect(() => {
        if (contactStore) {
            form.reset(contactStore);
        }
    }, [contactStore]);

    const onSubmit = async (formData: FormSchema) => {
        try {
            await api.post(`/api/ecommerce/contacts`, formData).then(res => {
                const id = res.data.idCrypto
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set("id", id);
                router.replace(newUrl.toString());
                setContactStore({
                    ...res.data,
                    fullname: res.data.fullName,
                    number: res.data.number.slice(2, res.data.number.length - 1)
                });
                setStepStore('3')
            }).catch(err => {
                console.log('err', err)
                toast.error(err.response.data.error)

            })
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Apelido</FormLabel>
                            <FormControl>
                                <Input disabled={isEdit} placeholder="Digite seu nome..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                                <PatternFormat
                                    disabled
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
                    name="fullname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                                <Input disabled={isEdit} placeholder="Digite seu nome completo..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="number"

                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                                <PatternFormat
                                    disabled
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

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input disabled={isEdit} type="email" placeholder="Digite seu e-mail..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div
                    className="flex flex-col w-full"
                >
                    <Button
                        type="submit"
                        variant="default"
                        className="rounded-full"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2Icon className="animate-spin" />}
                        Avançar
                    </Button>
                    <Button type="button" onClick={() => setStepStore('1')} className="w-full rounded-full" variant="link">
                        Voltar
                    </Button>
                </div>
            </form>
        </Form>
    );
}