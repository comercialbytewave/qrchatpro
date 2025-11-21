import { create } from "zustand";
import { Company } from "./interfaces/company";

type CompanytState = {

  companyStore: Company | undefined;
  setCompanytStore: (Companyt: any) => void;
  clearCompanytStore: () => void;
};

export const useCompanytStore = create<CompanytState>()(
  (set) => ({
    companyStore: undefined,
    setCompanytStore: (company) => set({ companyStore: company }),
    clearCompanytStore: () => set({ companyStore: undefined }),
  }),
)