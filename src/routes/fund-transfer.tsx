import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { accounts } from "@/lib/banking-data";
import { useCurrentBalance } from "@/hooks/useTransactions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap, Building2, Banknote, ArrowRight, Send, Loader2, ShieldCheck,
  Wallet, CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/fund-transfer")({
  component: FundTransfer,
  head: () => ({
    meta: [
      { title: "Fund Transfer — Indian One" },
      { name: "description", content: "Transfer money instantly via IMPS, NEFT, RTGS or within Indian One accounts." },
      { property: "og:title", content: "Fund Transfer — Indian One" },
      { property: "og:description", content: "Transfer money instantly via IMPS, NEFT, RTGS or within Indian One accounts." },
      { property: "og:url", content: "https://www.indianone.in/fund-transfer" },
    ],
    links: [{ rel: "canonical", href: "https://www.indianone.in/fund-transfer" }],
  }),
});

const modes = [
  { id: "imps", label: "IMPS", icon: Zap, sub: "Instant · 24x7", color: "from-amber-500 to-orange-600" },
  { id: "neft", label: "NEFT", icon: Building2, sub: "Batch · 30 min", color: "from-blue-600 to-indigo-700" },
  { id: "rtgs", label: "RTGS", icon: Banknote, sub: "Above ₹2L", color: "from-emerald-600 to-teal-700" },
  { id: "within", label: "Within Account", icon: Send, sub: "Instant · Free", color: "from-purple-600 to-pink-600" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

function FundTransfer() {
  const [mode, setMode] = useState("imps");
  const [payeeName, setPayeeName] = useState("");
  const [payeeAcc, setPayeeAcc] = useState("");
  const [payeeIfsc, setPayeeIfsc] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const acc = accounts[0];
  const balance = useCurrentBalance();

  const modeInfo = modes.find((m) => m.id === mode)!;
  const amt = parseFloat(amount) || 0;
  const charges = mode === "rtgs" ? 25 : mode === "neft" ? 5 : 0;
  const formValid = payeeName.trim() && payeeAcc.trim() && payeeIfsc.trim() && amount && pwd;

  const proceed = () => {
    if (!formValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1100);
  };

  if (done) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto pt-6">
          <Card className="p-7 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/15 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-9 h-9 text-success" />
            </div>
            <h1 className="text-xl font-bold">Transfer Successful</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {fmt(amt)} sent to <b>{payeeName}</b>
            </p>
            <div className="rounded-xl border bg-secondary/30 mt-4 text-[12px] divide-y text-left">
              <div className="flex justify-between px-4 py-2"><span className="text-muted-foreground">Reference</span><span className="font-mono">TXN{Math.floor(Math.random() * 9e6 + 1e6)}</span></div>
              <div className="flex justify-between px-4 py-2"><span className="text-muted-foreground">Status</span><span className="text-success font-semibold">Completed</span></div>
              <div className="flex justify-between px-4 py-2"><span className="text-muted-foreground">Mode</span><span className="font-semibold">{modeInfo.label}</span></div>
            </div>
            <Button className="w-full mt-5 bg-gradient-primary text-primary-foreground" onClick={() => navigate({ to: "/" })}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Fund Transfer"
        subtitle="Send money securely via IMPS, NEFT, RTGS or Within Account"
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
        <Card className="lg:col-span-2 p-4 shadow-card-soft">
          <h2 className="font-bold mb-1 text-sm">1. Payee Details</h2>
          <p className="text-[11px] text-muted-foreground mb-3">Enter the recipient's details to continue</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="ft-payee" className="text-[11px] font-semibold text-muted-foreground">Payee Name</label>
              <Input id="ft-payee" placeholder="Enter recipient's full name" value={payeeName} onChange={(e) => setPayeeName(e.target.value)} className="h-10" />
            </div>
            <div>
              <label htmlFor="ft-acc" className="text-[11px] font-semibold text-muted-foreground">Account Number</label>
              <Input id="ft-acc" placeholder="Enter account number" value={payeeAcc} onChange={(e) => setPayeeAcc(e.target.value)} className="h-10 font-mono" />
            </div>
            <div>
              <label htmlFor="ft-ifsc" className="text-[11px] font-semibold text-muted-foreground">IFSC Code</label>
              <Input id="ft-ifsc" placeholder="e.g. IDIB0ASHOKV" value={payeeIfsc} onChange={(e) => setPayeeIfsc(e.target.value.toUpperCase())} className="h-10 font-mono" />
            </div>
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
              <Input id="ft-password" type="password" placeholder="Enter your transaction password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="h-10" />
            </div>
          </div>
        </Card>

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
            <div className="text-[10px] opacity-70 mt-1">Available: <b>{fmt(balance)}</b></div>
          </div>

          <div className="space-y-2 text-[12px] mb-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payee</span>
              <span className="font-semibold text-right truncate ml-2">{payeeName || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account</span>
              <span className="font-mono font-semibold">{payeeAcc || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IFSC</span>
              <span className="font-mono font-semibold">{payeeIfsc || "—"}</span>
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
            {formValid && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-1.5 text-[10.5px] text-success bg-success/10 rounded-md px-2 py-1.5 mb-3">
                <ShieldCheck className="w-3 h-3" /> Secure encrypted transfer
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            disabled={!formValid || loading}
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
