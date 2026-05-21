import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Bell,
  Settings,
  LogOut,
  Search,
  Menu,
  Landmark,
  User,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { label: "All Accounts", to: "/accounts" },
  { label: "Fund Transfers", to: "/fund-transfer" },
  { label: "Manage Beneficiary", to: "/beneficiary" },
  { label: "Deposits", to: "/deposits" },
  { label: "Loans", to: "/loans" },
  { label: "Cards", to: "/cards" },
  { label: "Investments", to: "/investments" },
  { label: "Bill Payments", to: "/bills" },
  { label: "Service Requests", to: "/support" },
  { label: "Insurance", to: "/insurance" },
] as const;

export function TopNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border/60">
      <div className="flex items-center gap-3 px-3 sm:px-6 h-16">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-primary/10 transition-colors text-foreground"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 mr-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant">
            <Landmark className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-bold text-foreground tracking-tight">Bharat Bank</div>
            <div className="text-[10px] text-gold font-medium">SECURE NET BANKING</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1.5 ml-3 flex-1 max-w-md bg-secondary/60 rounded-xl px-3 py-2 border border-border/60">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search transactions, beneficiaries…"
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex-1 md:flex-none" />

        <div className="hidden lg:block text-right text-[11px] text-muted-foreground leading-tight">
          <div>Last login</div>
          <div className="font-medium text-foreground">21 May 2026, 09:42 AM</div>
        </div>

        <button
          onClick={() => toast("No new notifications")}
          className="relative p-2 rounded-xl hover:bg-primary/10 transition-colors"
        >
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
        </button>
        <Link to="/settings" className="p-2 rounded-xl hover:bg-primary/10 transition-colors">
          <Settings className="w-5 h-5 text-foreground" />
        </Link>

        <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-border">
          <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center text-gold-foreground font-bold text-sm shadow-card-soft">
            AR
          </div>
          <div className="hidden md:block leading-tight">
            <div className="text-sm font-semibold">Arjun R.</div>
            <div className="text-[10px] text-muted-foreground">CIF: 5489221</div>
          </div>
          <ChevronDown className="hidden md:block w-4 h-4 text-muted-foreground" />
        </div>

        <button
          onClick={() => toast.success("Logging out securely…")}
          className="hidden sm:flex items-center gap-1.5 ml-1 px-3 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>

      <nav className="hidden md:flex items-center gap-1 px-6 pb-2 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeProps={{ className: "bg-primary text-primary-foreground shadow-elegant" }}
            inactiveProps={{ className: "text-muted-foreground hover:bg-primary/10 hover:text-primary" }}
            className="px-3 py-1.5 text-[13px] font-medium rounded-lg whitespace-nowrap transition-all"
          >
            <motion.span whileHover={{ y: -1 }} className="inline-block">
              {item.label}
            </motion.span>
          </Link>
        ))}
      </nav>
    </header>
  );
}