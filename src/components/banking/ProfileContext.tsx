import { createContext, useContext, useState, ReactNode } from "react";
import { ProfilePanel } from "./ProfilePanel";

const Ctx = createContext<{ open: () => void; close: () => void }>({ open: () => {}, close: () => {} });
export const useProfilePanel = () => useContext(Ctx);

export function ProfilePanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open: () => setOpen(true), close: () => setOpen(false) }}>
      {children}
      <ProfilePanel open={isOpen} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
}