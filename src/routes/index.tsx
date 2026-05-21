import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Eye, EyeOff, ChevronRight, TrendingUp, ArrowUpRight, ArrowDownLeft,
  Receipt, CreditCard, PiggyBank, HandCoins, Phone,
  MessageSquare, FileText, Wallet, Send,
  Zap, Droplet, Flame, Wifi, Tv, Smartphone, Car, ShieldCheck, MapPin,
  Copy, Building2,
} from "lucide-react";
import { AppLayout } from "@/components/banking/AppLayout";
import { accounts, transactions } from "@/lib/banking-data";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useProfilePanel } from "@/components/banking/ProfileContext";

export const Route = createFileRoute("/")({ component: Dashboard });

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

const quickActions = [
  { label: "Bill Payment", icon: Receipt, to: "/bills", color: "from-amber-500 to-orange-600" },
  { label: "Debit Card", icon: CreditCard, to: "/cards", color: "from-blue-600 to-indigo-700" },
  { label: "Open FD", icon: PiggyBank, to: "/deposits", color: "from-emerald-600 to-teal-700" },
  { label: "Contact Us", icon: Phone, to: "/support", color: "from-purple-600 to-pink-600" },
  { label: "Loan Apply", icon: HandCoins, to: "/loans", color: "from-rose-600 to-red-700" },
  { label: "Service Request", icon: MessageSquare, to: "/support", color: "from-slate-600 to-slate-800" },
];

const bills = [
  { label: "Electricity", icon: Zap }, { label: "Water", icon: Droplet },
  { label: "Gas", icon: Flame }, { label: "Broadband", icon: Wifi },
  { label: "DTH", icon: Tv }, { label: "Mobile", icon: Smartphone },
  { label: "Credit Card", icon: CreditCard }, { label: "FASTag", icon: Car },
];

function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const acc = accounts[0];
  const profilePanel = useProfilePanel();
  const total = accounts.reduce((a, b) => a + b.balance, 0);

  return (
    <AppLayout>
      {/* Compact greeting banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 rounded-xl px-4 sm:px-5 py-3 text-white shadow-sm mb-5 relative overflow-hidden"
      >
        <div className="absolute -right-16 -top-12 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold ring-2 ring-white/20">
              AR
            </div>
            <div className="leading-tight">
              <div className="text-[11px] text-white/70">Good morning,</div>
              <h1 className="text-base sm:text-lg font-bold">Arjun Ramesh</h1>
              <div className="text-[10px] text-white/60 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-amber-300" /> Last login: 21 May 2026, 09:42 AM</span>
                <span className="hidden sm:flex items-center gap-1"><MapPin className="w-3 h-3" /> Chennai</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/70 uppercase tracking-wider">Total Balance</div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                {showBalance ? fmt(total) : "₹ ••••••"}
              </span>
              <button onClick={() => setShowBalance(!showBalance)} className="text-amber-300 hover:bg-white/10 rounded-md p-1" aria-label="Toggle balance">
                {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Single Current Account card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <div
            onClick={profilePanel.open}
            className={`relative rounded-2xl p-6 text-white shadow-xl bg-gradient-to-br ${acc.color} overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow group`}
          >
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-6 top-6 opacity-20 text-7xl font-bold tracking-tighter">₹</div>

            <div className="relative flex items-start justify-between mb-5">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/70 mb-0.5">Bharat Bank</div>
                <div className="text-sm font-bold flex items-center gap-2">
                  {acc.type}
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-semibold tracking-wider">PRIMARY</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {acc.status}
              </span>
            </div>

            <div className="relative">
              <div className="font-mono text-base tracking-[0.3em] text-white/90 mb-1">{acc.masked}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/60 mt-3">Available Balance</div>
              <div className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                {showBalance ? fmt(acc.balance) : "₹ ••••••••"}
              </div>
            </div>

            <div className="relative grid grid-cols-3 gap-2 text-xs border-t border-white/15 pt-3">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-white/55">IFSC</div>
                <div className="font-semibold flex items-center gap-1">
                  {acc.ifsc}
                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(acc.ifsc); toast.success("IFSC copied"); }}>
                    <Copy className="w-2.5 h-2.5 opacity-70 hover:opacity-100" />
                  </button>
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-white/55">Branch</div>
                <div className="font-semibold truncate">{acc.branch}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-white/55">Customer ID</div>
                <div className="font-semibold">{acc.customerId}</div>
              </div>
            </div>

            <div className="relative flex items-center justify-between mt-4 text-xs">
              <span className="text-white/70 group-hover:text-white transition-colors flex items-center gap-1">
                View full account details <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <Link
                to="/fund-transfer"
                onClick={(e) => e.stopPropagation()}
                className="bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full font-semibold transition-colors backdrop-blur"
              >
                Transfer
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: "Account Details", action: profilePanel.open, icon: Wallet },
              { label: "Statement", to: "/accounts/cur/statement", icon: FileText },
              { label: "M-Passbook", to: "/accounts/cur/passbook", icon: FileText },
            ].map((o) =>
              o.to ? (
                <Link key={o.label} to={o.to} className="bg-card border rounded-lg p-2.5 flex items-center gap-2 hover:border-primary/40 hover:shadow-sm transition-all text-xs font-semibold group">
                  <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <o.icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{o.label}</span>
                </Link>
              ) : (
                <button key={o.label} onClick={o.action} className="bg-card border rounded-lg p-2.5 flex items-center gap-2 hover:border-primary/40 hover:shadow-sm transition-all text-xs font-semibold group text-left">
                  <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <o.icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{o.label}</span>
                </button>
              )
            )}
          </div>
        </motion.div>

        {/* Quick Actions vertical grid */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((q, i) => (
              <motion.div key={q.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                <Link to={q.to} className="block group">
                  <div className="border rounded-xl p-3 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 transition-all cursor-pointer h-full bg-gradient-to-br from-card to-secondary/20">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${q.color} flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-shadow`}>
                      <q.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-[11px] font-semibold text-foreground leading-tight">{q.label}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">Recent Transactions</h2>
            <Link to="/accounts/cur/statement" className="text-xs text-primary font-semibold hover:underline">View all →</Link>
          </div>
          <div className="divide-y">
            {transactions.slice(0, 6).map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-2.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.type === "Credit" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {t.type === "Credit" ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{t.narration}</div>
                  <div className="text-[10px] text-muted-foreground">{t.date} · {t.id}</div>
                </div>
                <div className={`font-semibold text-sm whitespace-nowrap ${t.type === "Credit" ? "text-success" : "text-foreground"}`}>
                  {t.type === "Credit" ? "+" : "−"} {fmt(t.type === "Credit" ? t.credit : t.debit)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Spending insight */}
        <Card className="p-4 bg-gradient-to-br from-card to-secondary/40">
          <h2 className="text-base font-bold mb-0.5">This Month</h2>
          <p className="text-[10px] text-muted-foreground mb-3">Spending overview</p>
          <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-xl p-3 mb-3">
            <div className="text-[10px] opacity-80">Total Spent</div>
            <div className="text-xl font-bold">{fmt(48230)}</div>
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
            <div key={c.label} className="mb-2">
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="font-medium">{c.label}</span><span className="text-muted-foreground">{fmt(c.amt)}</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-amber-500 to-orange-600" />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Bill quick pay */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Pay Bills & Recharge</h2>
          <Link to="/bills" className="text-xs text-primary font-semibold hover:underline">All billers →</Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {bills.map((b) => (
            <button key={b.label} onClick={() => toast("Opening " + b.label)} className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-primary/5 transition-colors group">
              <div className="w-11 h-11 rounded-xl bg-secondary group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-orange-600 flex items-center justify-center transition-all">
                <b.icon className="w-4 h-4 text-primary group-hover:text-white" />
              </div>
              <span className="text-[10px] font-medium text-center">{b.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </AppLayout>
  );
}
