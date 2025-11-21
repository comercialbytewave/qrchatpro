import { Store } from "@/data/store/interfaces/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SelectState = {
  selectedStore: Store | undefined;
  setSelectedStore: (store: Store) => void;
  clearSelection: () => void;
};

export const useSelectStore = create<SelectState>()(
  persist(
    (set) => ({
      selectedStore: undefined,
      setSelectedStore: (store) => set({ selectedStore: store }),
      clearSelection: () => set({ selectedStore: undefined }),
    }),
    {
      name: "selected-Store-storage",
    }
  )
);
