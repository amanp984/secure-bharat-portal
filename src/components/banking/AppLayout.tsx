import { ReactNode, useState } from "react";
import { Link } from "@tanstack/react-router";
import { TopNavbar } from "./TopNavbar";
import { Sidebar } from "./Sidebar";
import { BankingModalProvider } from "./ModalContext";
import { ProfilePanelProvider } from "./ProfileContext";
import { Toaster } from "@/components/ui/sonner";
import { brand } from "@/lib/brand";

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <BankingModalProvider>
      <ProfilePanelProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <TopNavbar onMenuClick={() => setOpen(true)} />
          <Sidebar open={open} onClose={() => setOpen(false)} />
          <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-7">{children}</main>
          <footer className="border-t bg-card/80 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <div>© {new Date().getFullYear()} {brand.name}. Independent demonstration platform — not a bank.</div>
              <div className="flex gap-4">
                <Link to="/terms" className="hover:text-primary font-medium">Terms &amp; Conditions</Link>
                <Link to="/privacy" className="hover:text-primary font-medium">Privacy Policy</Link>
                <Link to="/contact" className="hover:text-primary font-medium">Contact Us</Link>
              </div>
            </div>
          </footer>
        </div>
      </ProfilePanelProvider>
      <Toaster position="top-right" />
    </BankingModalProvider>
  );
}
