import { ReactNode, useState } from "react";
import { TopNavbar } from "./TopNavbar";
import { Sidebar } from "./Sidebar";
import { BankingModalProvider } from "./ModalContext";
import { ProfilePanelProvider } from "./ProfileContext";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <BankingModalProvider>
      <ProfilePanelProvider>
        <div className="min-h-screen bg-background">
          <TopNavbar onMenuClick={() => setOpen(true)} />
          <Sidebar open={open} onClose={() => setOpen(false)} />
          <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-7">{children}</main>
        </div>
      </ProfilePanelProvider>
      <Toaster position="top-right" />
    </BankingModalProvider>
  );
}