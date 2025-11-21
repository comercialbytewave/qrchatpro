'use client'

import OrderList from "./components/order-list";
import { api } from "@/lib/api";
import { useContactStore } from "@/data/store/useContactStore";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { z } from "zod";

import { Button } from "@/components/ui/button";

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

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { isValidCpf, removeCpfPunctuation, removerMascaraTelefone } from "@/helpers/helpers";
import { useCompanytStore } from "@/data/store/useCompanyStore";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const OrdersPage = () => {

  const router = useRouter();
  const { toast } = useToast()
  const searchParams = useSearchParams();

  const { companyStore } = useCompanytStore()
  const { contactStore, setContactStore } = useContactStore()

  const id = searchParams.get("id");
  const idParams = id ? `?id=${id}` : ''

  const [showModalIdentification, setShowModalIdentification] = useState(false)

  const handleOpenModalIdentification = () => {
    setShowModalIdentification(prevState => !prevState)
  }

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: ''
    }
  })

  const [orders, setOrders] = useState([])

  const getOrders = async (contactId: string) => {
    await api.get(`/api/ecommerce/orders/list?id=${contactId}&pageNumber=1&pageSize=20`).then(res => {
      setOrders(res.data.data)
      setShowModalIdentification(false)
    }).catch(err => {
      toast({
        title: 'Erro',
        description: `Não há pedidos para esse contato`,
        variant: 'destructive'
      })
      console.log(err?.response?.data?.error)
      const newUrl = new URL(window.location.href).toString().split('?')[0];
      router.replace(newUrl.toString());
    })
  }

  const onSubmit = async (data: FormSchema) => {
    const documentFormated = removeCpfPunctuation(data.document)
    const phoneFormated = removerMascaraTelefone(data.phone)
    await api.get(`/api/ecommerce/contacts/${documentFormated}/${phoneFormated}`).then(async res => {
      const id = res.data.idCrypto
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("id", id);
      router.replace(newUrl.toString());
      setContactStore(res.data)
    }).catch(err => {
      toast({
        title: 'Erro',
        description: 'Cadastro não encontrado',
        variant: 'destructive'
      })
    })
  };

  const handleCancel = () => {
    router.replace(`/${companyStore?.slug}/menu${idParams}`);
  };

  useEffect(() => {
    if (id) {
      getOrders(id)
    } else {
      setShowModalIdentification(true)
    }
  }, [id])


  return <>

    <OrderList orders={orders} />
    <Dialog open={showModalIdentification} onOpenChange={() => handleOpenModalIdentification()}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Visualizar Pedidos</DialogTitle>
          <DialogDescription>
            Insira seu CPF abaixo para visualizar seus pedidos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem className="px-4">
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
                  className="data-[visible=true]:hidden px-4"
                >
                  <FormLabel>Telefone</FormLabel>
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
            <DialogFooter
              className="flex gap-2 flex-col md:flex-row"
            >
              <Button variant="default" className="w-full rounded-full">
                Confirmar
              </Button>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  </>

};

export default OrdersPage;
