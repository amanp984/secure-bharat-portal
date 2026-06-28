import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, Wallet, ScrollText, Send, Zap,
  Building2, Banknote, CreditCard, ShieldCheck,
  HandCoins, PiggyBank, Receipt, MessageSquare,
  AlertCircle, Headphones, MapPin, Settings,
  LogOut, X,
} from "lucide-react";
import { useBankingModal } from "./ModalContext";
import { toast } from "sonner";
import { brand } from "@/lib/brand";
import { IndianOneLogo } from "./IndianBankOneLogo";
import { recordLogout } from "@/lib/session";

type Item = { label: string; icon: any; to?: string; action?: "mobile-only" | "logout" };

const sections: { title: string; items: Item[] }[] = [
  {
    title: "Account",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, to: "/" },
      { label: "Account Summary", icon: Wallet, to: "/accounts" },
      { label: "Full Statement", icon: ScrollText, to: "/transactions" },
    ],
  },
  {
    title: "Transfers",
    items: [
      { label: "Fund Transfer", icon: Send, to: "/fund-transfer" },
      { label: "IMPS", icon: Zap, to: "/fund-transfer" },
      { label: "NEFT", icon: Building2, to: "/fund-transfer" },
      { label: "RTGS", icon: Banknote, to: "/fund-transfer" },
    ],
  },
  {
    title: "Cards",
    items: [
      { label: "Debit Card", icon: CreditCard, to: "/cards" },
    ],
  },
  {
    title: "Investments",
    items: [
      { label: "Loans", icon: HandCoins, to: "/loans" },
      { label: "Deposits", icon: PiggyBank, to: "/deposits" },
    ],
  },
  {
    title: "Pay & Recharge",
    items: [
      { label: "Bill Payments", icon: Receipt, to: "/bills" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Support", icon: Headphones, to: "/support" },
      { label: "Complaints", icon: AlertCircle, to: "/support" },
      { label: "Customer Care", icon: MessageSquare, to: "/support" },
      { label: "Branch Locator", icon: MapPin, to: "/support" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Settings", icon: Settings, to: "/settings" },
      { label: "Dashboard Settings", icon: Settings, to: "/dashboard-settings" },
      { label: "Logout", icon: LogOut, action: "logout" },
    ],
  },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const modal = useBankingModal();
  const navigate = useNavigate();

  const handleAction = (item: Item) => {
    if (item.action === "logout") {
      recordLogout();
      localStorage.removeItem("indian_one_demo_auth");
      toast.success("Logging out securely…");
      setTimeout(() => { navigate({ to: "/" }); window.location.reload(); }, 500);
    } else if (item.action) {
      modal.show(item.action);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-card shadow-elegant flex flex-col border-r"
          >
            <div className="bg-primary text-primary-foreground p-5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-1.5">
                  <IndianOneLogo className="w-full h-full" />
                </div>
                <div>
                  <div className="font-bold text-lg">{brand.name}</div>
                  <div className="text-[11px] text-white/80">{brand.tagline}</div>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close menu" className="p-2 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-5">
              {sections.map((section) => (
                <div key={section.title}>
                  <div className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    {section.title}
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const cls =
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all group";
                      if (item.to && !item.action) {
                        return (
                          <Link
                            key={item.label}
                            to={item.to}
                            onClick={onClose}
                            className={cls}
                          >
                            <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      }
                      return (
                        <button key={item.label} onClick={() => handleAction(item)} className={cls}>
                          <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-secondary/50">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                <span>256-bit Secure SSL Session</span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
