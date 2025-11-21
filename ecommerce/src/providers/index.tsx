"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/data/context/cart";
import { ThemeProvider } from "@/lib/theme-provider";
import { RouteHistoryProvider } from "@/hooks/use-history";

type ProviderProps = {
  children: ReactNode;
};

const queryClient = new QueryClient();

export const Providers = ({ children }: ProviderProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <RouteHistoryProvider>
            {children}
          </RouteHistoryProvider>
        </CartProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
};
