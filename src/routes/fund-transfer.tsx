import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { accounts, beneficiaries } from "@/lib/banking-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap, Building2, Banknote, ArrowRight, Send, Loader2, ShieldCheck,
  BadgeCheck, Wallet,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";

const transferSearch = z.object({ beneficiary: z.string().optional() });

export const Route = createFileRoute("/fund-transfer")({
  component: FundTransfer,
  validateSearch: transferSearch,
  head: () => ({
    meta: [
      { title: "Fund Transfer — Indian Bank One" },
      { name: "description", content: "Transfer money instantly via IMPS, NEFT, RTGS or within Indian Bank One accounts." },
      { property: "og:title", content: "Fund Transfer — Indian Bank One" },
      { property: "og:description", content: "Transfer money instantly via IMPS, NEFT, RTGS or within Indian Bank One accounts." },
      { property: "og:url", content: "https://www.indianbankone.in/fund-transfer" },
    ],
    links: [{ rel: "canonical", href: "https://www.indianbankone.in/fund-transfer" }],
  }),
});

const modes = [
  { id: "imps", label: "IMPS", icon: Zap, sub: "Instant · 24x7", color: "from-amber-500 to-orange-600" },
  { id: "neft", label: "NEFT", icon: Building2, sub: "Batch · 30 min", color: "from-blue-600 to-indigo-700" },
  { id: "rtgs", label: "RTGS", icon: Banknote, sub: "Above ₹2L", color: "from-emerald-600 to-teal-700" },
  { id: "within", label: "Within Bank", icon: Send, sub: "Instant · Free", color: "from-purple-600 to-pink-600" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

function FundTransfer() {
  const { beneficiary } = Route.useSearch();
  const [mode, setMode] = useState("imps");
  const [selected, setSelected] = useState<string | null>(beneficiary ?? null);
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const acc = accounts[0];

  const ben = beneficiaries.find((b) => b.id === selected);
  const modeInfo = modes.find((m) => m.id === mode)!;
  const amt = parseFloat(amount) || 0;
  const charges = mode === "rtgs" ? 25 : mode === "neft" ? 5 : 0;

  const proceed = () => {
    if (!ben || !amount || !pwd) return;
    setLoading(true);
    setTimeout(() => {
      navigate({ to: "/fund-transfer/otp", search: { amt: amount, to: ben.name } });
    }, 900);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Fund Transfer"
        subtitle="Send money securely via IMPS, NEFT, RTGS or Within Bank"
      />

      {/* Mode selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {modes.map((m) => (
          <motion.button
            key={m.id}
            whileHover={{ y: -2 }}
            onClick={() => setMode(m.id)}
            className={`relative p-3 rounded-xl border text-left overflow-hidden transition-all ${
              mode === m.id
                ? "border-primary shadow-elegant bg-card"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            {mode === m.id && (
              <motion.div
                layoutId="mode-bg"
                className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-10`}
              />
            )}
            <div className="relative">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center mb-2 shadow-sm`}>
                <m.icon className="w-4 h-4 text-white" />
              </div>
              <div className="font-bold text-sm">{m.label}</div>
              <div className="text-[10px] text-muted-foreground">{m.sub}</div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Beneficiary picker */}
        <Card className="lg:col-span-2 p-4 shadow-card-soft">
          <h2 className="font-bold mb-1 text-sm">1. Select Beneficiary</h2>
          <p className="text-[11px] text-muted-foreground mb-3">Choose a verified payee to continue</p>
          <div className="space-y-2">
            {beneficiaries.map((b) => (
              <motion.button
                key={b.id}
                whileHover={{ x: 3 }}
                onClick={() => setSelected(b.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  selected === b.id
                    ? "border-primary bg-primary/5 shadow-card-soft"
                    : "border-border hover:bg-secondary/50"
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-gradient-gold text-gold-foreground flex items-center justify-center font-bold shrink-0">
                  {b.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm flex items-center gap-1">
                    {b.name} <BadgeCheck className="w-3 h-3 text-primary" />
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{b.bank} · {b.acc} · Last: {b.last}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === b.id ? "border-primary bg-primary" : "border-border"}`}>
                  {selected === b.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </motion.button>
            ))}
          </div>

          <h2 className="font-bold mt-5 mb-3 text-sm">2. Transfer Details</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="ft-amount" className="text-[11px] font-semibold text-muted-foreground">Amount (₹)</label>
              <Input id="ft-amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-10 text-lg font-bold" />
            </div>
            <div>
              <label htmlFor="ft-remarks" className="text-[11px] font-semibold text-muted-foreground">Remarks (Optional)</label>
              <Input id="ft-remarks" placeholder="e.g. Rent for May" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="h-10" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ft-password" className="text-[11px] font-semibold text-muted-foreground">Transaction Password</label>
              <Input id="ft-password" type="password" placeholder="Enter your 6-digit transaction password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="h-10" />
            </div>
          </div>
        </Card>

        {/* Summary sidebar */}
        <Card className="p-4 h-fit sticky top-24 shadow-card-soft overflow-hidden border-t-4 border-t-primary">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${modeInfo.color} flex items-center justify-center`}>
              <modeInfo.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Transaction Summary</div>
              <div className="text-sm font-bold">{modeInfo.label} Transfer</div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-3 mb-3">
            <div className="text-[10px] uppercase tracking-widest opacity-70 flex items-center gap-1"><Wallet className="w-3 h-3" /> Debit Account</div>
            <div className="text-[11px] font-mono mt-0.5">{acc.masked}</div>
            <div className="text-[10px] opacity-70 mt-1">Available: <b>{fmt(acc.balance)}</b></div>
          </div>

          <div className="space-y-2 text-[12px] mb-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Beneficiary</span>
              <span className="font-semibold text-right truncate ml-2">{ben?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bank</span>
              <span className="font-semibold">{ben?.bank ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold">{amt > 0 ? fmt(amt) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Charges</span>
              <span className="font-semibold">{charges > 0 ? fmt(charges) : "Free"}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-bold">Total Debit</span>
              <span className="font-bold text-primary">{amt > 0 ? fmt(amt + charges) : "—"}</span>
            </div>
          </div>

          <AnimatePresence>
            {ben && amt > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-1.5 text-[10.5px] text-success bg-success/10 rounded-md px-2 py-1.5 mb-3">
                <ShieldCheck className="w-3 h-3" /> Secure encrypted transfer · OTP verification next
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            disabled={!ben || !amount || !pwd || loading}
            onClick={proceed}
            className="w-full bg-gradient-primary text-primary-foreground hover:opacity-95 h-10"
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Processing…</> : <>Proceed Securely <ArrowRight className="w-4 h-4 ml-1" /></>}
          </Button>
          <Link to="/" className="block text-center text-[11px] text-muted-foreground hover:text-primary mt-2">Cancel and return to Dashboard</Link>
        </Card>
      </div>
    </AppLayout>
  );
}
