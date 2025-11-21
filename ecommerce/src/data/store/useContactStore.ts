import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ContactState = {
  isEdit: boolean;
  setIsEdit: (isEditValue: boolean) => void;
  contactStore: any | undefined;
  setContactStore: (contact: any) => void;
  clearContactStore: () => void;
};

export const useContactStore = create<ContactState>()(
  persist(
    (set) => ({
      isEdit: false,
      contactStore: undefined,
      setIsEdit: (isEditValue) => set({ isEdit: isEditValue }),
      setContactStore: (contact) => set({ contactStore: contact }),
      clearContactStore: () => set({ contactStore: undefined }),
    }),
    {
      name: 'contact-storage',
    }
  )
);
