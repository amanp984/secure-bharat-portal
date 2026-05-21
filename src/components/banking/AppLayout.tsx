import { ReactNode, useState } from "react";
import { TopNavbar } from "./TopNavbar";
import { Sidebar } from "./Sidebar";
import { BankingModalProvider } from "./ModalContext";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <BankingModalProvider>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gold/20 blur-3xl" />
        </div>
        <TopNavbar onMenuClick={() => setOpen(true)} />
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <main className="mx-auto max-w-7xl p-4 sm:p-6">{children}</main>
      </div>
      <Toaster position="top-right" richColors />
    </BankingModalProvider>
  );
}