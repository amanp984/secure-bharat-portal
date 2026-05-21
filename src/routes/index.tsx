import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  Eye, EyeOff, ChevronRight, TrendingUp, ArrowUpRight, ArrowDownLeft,
  Receipt, CreditCard, PiggyBank, Gift, Heart, HandCoins, Phone,
  ShieldAlert, MessageSquare, Lock, FileText, Wallet, Send,
  Zap, Droplet, Flame, Wifi, Tv, Smartphone, Car, ShieldCheck,
} from "lucide-react";
import { AppLayout } from "@/components/banking/AppLayout";
import { accounts, transactions } from "@/lib/banking-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/")({ component: Dashboard });

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

const quickActions = [
  { label: "Bill Payments", icon: Receipt, to: "/bills" },
  { label: "Debit Card", icon: CreditCard, to: "/cards" },
  { label: "Credit Card", icon: CreditCard, to: "/cards" },
  { label: "Open FD", icon: PiggyBank, to: "/deposits" },
  { label: "Open RD", icon: PiggyBank, to: "/deposits" },
  { label: "Rewards", icon: Gift, to: "/investments" },
  { label: "Insurance", icon: Heart, to: "/insurance" },
  { label: "Loan Apply", icon: HandCoins, to: "/loans" },
  { label: "Contact Us", icon: Phone, to: "/support" },
  { label: "Forgot Txn", icon: FileText, to: "/support" },
  { label: "Block Banking", icon: Lock, to: "/cards" },
  { label: "Service Req.", icon: MessageSquare, to: "/support" },
];

const bills = [
  { label: "Electricity", icon: Zap }, { label: "Water", icon: Droplet },
  { label: "Gas", icon: Flame }, { label: "Broadband", icon: Wifi },
  { label: "DTH", icon: Tv }, { label: "Mobile", icon: Smartphone },
  { label: "Credit Card", icon: CreditCard }, { label: "FASTag", icon: Car },
];

function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const [emblaRef] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });

  return (
    <AppLayout>
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-hero rounded-3xl p-6 sm:p-8 text-primary-foreground shadow-elegant mb-6 relative overflow-hidden"
      >
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -right-10 bottom-0 w-48 h-48 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-white/70">Good morning,</div>
            <h1 className="text-2xl sm:text-3xl font-bold">Arjun Ramesh 👋</h1>
            <div className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" /> Last login: 21 May 2026, 09:42 AM · Chennai
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/70">Total Net Worth</div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">
              {showBalance ? fmt(accounts.reduce((a, b) => a + b.balance, 0)) : "₹ ••••••"}
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="text-xs text-gold mt-1 inline-flex items-center gap-1 hover:underline">
              {showBalance ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showBalance ? "Hide" : "Show"} balances
            </button>
          </div>
        </div>
      </motion.div>

      {/* My Accounts carousel */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">My Accounts</h2>
          <Link to="/accounts" className="text-sm text-primary font-medium inline-flex items-center hover:gap-1.5 gap-1 transition-all">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4">
            {accounts.map((acc, i) => (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
              >
                <div className={`relative rounded-2xl p-5 text-white shadow-elegant bg-gradient-to-br ${acc.color} overflow-hidden h-full`}>
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    {acc.primary && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold text-gold-foreground">PRIMARY</span>}
                  </div>
                  <div className="text-[11px] uppercase tracking-widest text-white/70 mb-1">{acc.type}</div>
                  <div className="font-mono text-sm mb-5">{acc.masked}</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60">Available Balance</div>
                  <div className="text-2xl font-bold mb-4">{showBalance ? fmt(acc.balance) : "₹ ••••••"}</div>
                  <div className="flex items-center justify-between text-xs">
                    <Link to="/accounts/$id" params={{ id: acc.id }} className="underline-offset-2 hover:underline">Details</Link>
                    <Link to="/accounts/$id/statement" params={{ id: acc.id }} className="underline-offset-2 hover:underline">Statement</Link>
                    <Link to="/fund-transfer" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-medium transition-colors">Transfer</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Account Details", to: "/accounts/sav", icon: Wallet },
            { label: "Account Statement", to: "/accounts/sav/statement", icon: FileText },
            { label: "M-Passbook", to: "/accounts/sav/passbook", icon: FileText },
            { label: "Fund Transfer", to: "/fund-transfer", icon: Send },
          ].map((o) => (
            <Link key={o.label} to={o.to} className="bg-card border rounded-xl p-3 flex items-center gap-2 hover:shadow-card-soft hover:border-primary/40 transition-all text-sm font-medium group">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <o.icon className="w-4 h-4" />
              </div>
              <span>{o.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickActions.map((q, i) => (
            <motion.div key={q.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <Link to={q.to} className="block">
                <Card className="p-4 hover:shadow-elegant hover:-translate-y-1 hover:border-primary/40 transition-all duration-300 cursor-pointer text-center group h-full">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center mb-2 group-hover:bg-gradient-primary transition-all">
                    <q.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div className="text-xs font-medium text-foreground">{q.label}</div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Transactions</h2>
            <Link to="/accounts/sav/statement" className="text-sm text-primary font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {transactions.slice(0, 6).map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === "Credit" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {t.type === "Credit" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{t.narration}</div>
                  <div className="text-xs text-muted-foreground">{t.date} · {t.id}</div>
                </div>
                <div className={`font-semibold text-sm whitespace-nowrap ${t.type === "Credit" ? "text-success" : "text-foreground"}`}>
                  {t.type === "Credit" ? "+" : "−"} {fmt(t.type === "Credit" ? t.credit : t.debit)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Spending insight */}
        <Card className="p-5 bg-gradient-to-br from-card to-secondary/40">
          <h2 className="text-lg font-bold mb-1">This Month</h2>
          <p className="text-xs text-muted-foreground mb-4">Spending overview</p>
          <div className="bg-gradient-primary text-primary-foreground rounded-2xl p-4 mb-4">
            <div className="text-xs opacity-80">Total Spent</div>
            <div className="text-2xl font-bold">{fmt(48230)}</div>
            <div className="text-xs opacity-80 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> 12% vs last month
            </div>
          </div>
          {[
            { label: "Food & Dining", pct: 78, amt: 18450 },
            { label: "Shopping", pct: 55, amt: 12300 },
            { label: "Bills & Utilities", pct: 42, amt: 9870 },
            { label: "Transport", pct: 28, amt: 4210 },
          ].map((c) => (
            <div key={c.label} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">{c.label}</span><span className="text-muted-foreground">{fmt(c.amt)}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-gold" />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Bill quick pay */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Pay Bills & Recharge</h2>
          <Link to="/bills" className="text-sm text-primary font-medium hover:underline">All billers</Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {bills.map((b) => (
            <button key={b.label} onClick={() => toast("Opening " + b.label)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-primary/5 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-secondary group-hover:bg-gradient-gold flex items-center justify-center transition-all">
                <b.icon className="w-5 h-5 text-primary group-hover:text-gold-foreground" />
              </div>
              <span className="text-[11px] font-medium text-center">{b.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </AppLayout>
  );
}
