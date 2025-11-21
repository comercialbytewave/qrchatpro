import { z } from "zod";

export const formatZodErrors = (errors: z.ZodError): string[] => {
  return errors.errors.map(err => {
    const path = err.path.join(".");
    return path ? `${path}: ${err.message}` : err.message;
  });
};
