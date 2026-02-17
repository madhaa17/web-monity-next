import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ShowAmountState {
  showAmount: boolean;
  toggleShowAmount: () => void;
}

export const useShowAmountStore = create<ShowAmountState>()(
  persist(
    (set) => ({
      showAmount: false,
      toggleShowAmount: () =>
        set((s) => ({ showAmount: !s.showAmount })),
    }),
    { name: "show-amount" }
  )
);
