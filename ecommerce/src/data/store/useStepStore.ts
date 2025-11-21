import { create } from "zustand";

type StepState = {
  stepStore: string | undefined;
  setStepStore: (step: string) => void;
  clearStepStore: () => void;
};

export const useStepStore = create<StepState>((set) => ({
  stepStore: undefined,
  setStepStore: (step) => set({ stepStore: step }),
  clearStepStore: () => set({ stepStore: undefined }),
})
)
