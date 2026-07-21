import { ReactNode, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { TopNavbar } from "./TopNavbar";
import { Sidebar } from "./Sidebar";
import { BankingModalProvider } from "./ModalContext";
import { ProfilePanelProvider } from "./ProfileContext";
import { Toaster } from "@/components/ui/sonner";
import { brand } from "@/lib/brand";
import { useBankingStore } from "@/lib/banking-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ADMIN_PASSWORD = "USER1947";
const UNLOCK_KEY = "indian_one_dashboard_settings_unlocked";

function DashboardSettingsSecretTrigger() {
  const navigate = useNavigate();
  const clicks = useRef<number[]>([]);
  const [askPwd, setAskPwd] = useState(false);
  const [pwd, setPwd] = useState("");

  const handleClick = () => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 5000), now];
    if (clicks.current.length >= 10) {
      clicks.current = [];
      setAskPwd(true);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(UNLOCK_KEY, "1");
      } catch {}
      setAskPwd(false);
      setPwd("");
      navigate({ to: "/dashboard-settings" });
    } else {
      toast.error("Invalid Password");
      setPwd("");
    }
  };

  return (
    <>
      <span
        onClick={handleClick}
        className="text-muted-foreground select-none"
        aria-hidden="true"
      >
        Dashboard Settings
      </span>
      <Dialog open={askPwd} onOpenChange={(o) => { setAskPwd(o); if (!o) setPwd(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Administrator Access</DialogTitle>
            <DialogDescription>Enter password to continue.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoFocus
              placeholder="Password"
            />
            <Button type="submit" className="w-full">Unlock</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  useBankingStore();
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
              <div className="flex gap-4 items-center">
                <Link to="/terms" className="hover:text-primary font-medium">Terms &amp; Conditions</Link>
                <Link to="/privacy" className="hover:text-primary font-medium">Privacy Policy</Link>
                <Link to="/contact" className="hover:text-primary font-medium">Contact Us</Link>
                <DashboardSettingsSecretTrigger />
              </div>
            </div>
          </footer>
        </div>
      </ProfilePanelProvider>
      <Toaster position="top-right" />
    </BankingModalProvider>
  );
}
