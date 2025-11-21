import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Order = {
    deliveryMethod: string
    paymentMethod: {
        id: number
        value: number
        changeFor: number
        installments: number
        name: string,
        freight: number
    } | undefined;
    contactAddressId: {
        id: number | null,
        name: string
    } | undefined;
};
type OrderState = {
    order: Order
    updateOrderField: <K extends keyof Order>(key: K, value: Order[K]) => void;
    setOrder: (store: Order) => void;

};

export const useOrderStore = create<OrderState>()(
    persist(
        (set) => ({
            order: {
                deliveryMethod: 'COLLECT_AT_PHARMACY',
                paymentMethod: undefined,
                contactAddressId: undefined,
            },
            updateOrderField: (key, value) =>
                set((state) => ({
                    order: {
                        ...state.order,
                        [key]: value,
                    },
                })),
            setOrder: (order: Order) => set({ order: order }),
        }),
        {
            name: "order-storage",
        }
    )
);
