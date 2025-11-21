import { z } from "zod";

export const ContactCreateSchema = z.object({
  name: z.string().nonempty("Nome é obrigatório").trim(),
  number: z
    .string()
    .nonempty("Telefone é obrigatório")
    .regex(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/, "Telefone inválido")
    .trim(),
  email: z
    .string()
    .nonempty("Email é obrigatório")
    .email("Email inválido")
    .trim(),
  document: z
    .string()
    .nonempty("CPF é obrigatório")
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido")
    .trim()
});
