import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, LogOut, Search, Menu, ChevronDown, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useProfilePanel } from "./ProfileContext";
import { profile } from "@/lib/banking-data";
import { brand } from "@/lib/brand";
import { IndianBankOneLogo } from "./IndianBankOneLogo";
import { getLastLogin, recordLogout } from "@/lib/session";

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "All Accounts", to: "/accounts" },
  { label: "Fund Transfers", to: "/fund-transfer" },
  { label: "Manage Beneficiary", to: "/beneficiary" },
  { label: "Deposits", to: "/deposits" },
  { label: "Loans", to: "/loans" },
  { label: "Cards", to: "/cards" },
  { label: "Investments", to: "/investments" },
  { label: "Bill Payments", to: "/bills" },
  { label: "Service Requests", to: "/support" },
] as const;

export function TopNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { open } = useProfilePanel();
  const navigate = useNavigate();

  const logout = () => {
    recordLogout();
    localStorage.removeItem("indian_bank_one_demo_auth");
    toast.success("Logged out securely");
    setTimeout(() => navigate({ to: "/" }), 400);
    setTimeout(() => window.location.reload(), 600);
  };

  const lastLogin = getLastLogin();

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b shadow-sm">
      <div className="h-0.5 bg-gradient-primary" />

      <div className="flex items-center gap-3 px-3 sm:px-6 h-14">
        <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-primary/10 text-foreground" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 mr-2">
          <div className="w-9 h-9 rounded-md bg-white border flex items-center justify-center shadow-sm p-1">
            <IndianBankOneLogo className="w-full h-full" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-bold text-foreground tracking-tight text-sm">{brand.name}</div>
            <div className="text-[9px] text-muted-foreground font-semibold tracking-widest">{brand.tagline.toUpperCase()}</div>
          </div>
        </Link>

        <label htmlFor="global-search" className="hidden md:flex items-center gap-1.5 ml-3 flex-1 max-w-sm bg-secondary/70 rounded-lg px-3 py-1.5 border">
          <Search className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Search</span>
          <input
            id="global-search"
            aria-label="Search transactions, payees and services"
            placeholder="Search transactions, payees, services…"
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground"
          />
        </label>

        <div className="flex-1 md:flex-none" />

        <div className="hidden lg:flex flex-col text-right text-[10px] text-muted-foreground leading-tight mr-1">
          <span className="flex items-center justify-end gap-1 text-success font-medium">
            <ShieldCheck className="w-3 h-3" /> Secure Session
          </span>
          <span>Last login: {lastLogin}</span>
        </div>

        <button onClick={() => toast("No new notifications")} aria-label="Notifications" className="relative p-2 rounded-lg hover:bg-primary/10">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
        </button>

        <button
          onClick={open}
          className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 ml-1 border rounded-full hover:bg-primary/5 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-sm">
            DS
          </div>
          <div className="hidden md:block leading-tight text-left">
            <div className="text-xs font-semibold">Dharmendra S.</div>
            <div className="text-[9px] text-muted-foreground">CIF: {profile.customerId}</div>
          </div>
          <ChevronDown className="hidden md:block w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <button
          onClick={logout}
          className="hidden sm:flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>

      <nav className="hidden md:flex items-center gap-0.5 px-6 pb-1.5 overflow-x-auto scrollbar-hide border-t border-border/40 bg-gradient-to-b from-secondary/30 to-transparent">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeProps={{ className: "text-primary border-primary" }}
            inactiveProps={{ className: "text-muted-foreground border-transparent hover:text-primary hover:border-primary/40" }}
            className="px-3 pt-2 pb-1.5 text-[12.5px] font-semibold whitespace-nowrap border-b-2 transition-colors"
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