import { z } from "zod";

export const FilterProductListSchema = z.object({
  storeId: z
    .string()
    .nonempty('storeId é obrigatório')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'storeId deve ser um número inteiro positivo',
    }),
  categoryId: z
    .string()
    .optional()
    .transform((val) => val && parseInt(val, 10)),
  searchParam: z.string().optional(),
  pageNumber: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'pageNumber deve ser um número inteiro positivo',
    }),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'pageSize deve ser um número inteiro positivo',
    }),
});

export const ProductStoreCreateSchema = z.object({
  storeId: z.number(),
  stock: z.number(),
  costPrice: z.number(),
  sellingPrice: z.number(),
  promotionPrice: z.number()
});

export const ProductCreateOrUpdateSchema = z.object({
  ean: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  categoryId: z.number(),
  media: z.string().nullable().optional(),
  productStore: z.array(ProductStoreCreateSchema)
});

export const ProductCreateOrUpdateManySchema = z.object({
  data: z.array(ProductCreateOrUpdateSchema),
  companyId: z.number()
});
