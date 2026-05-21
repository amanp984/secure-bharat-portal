import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { beneficiaries } from "@/lib/banking-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Building2, Banknote, Smartphone, ArrowRight, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/fund-transfer")({ component: FundTransfer });

const modes = [
  { id: "imps", label: "IMPS", icon: Zap },
  { id: "neft", label: "NEFT", icon: Building2 },
  { id: "rtgs", label: "RTGS", icon: Banknote },
  { id: "within", label: "Within Bank", icon: Send },
  { id: "upi", label: "UPI", icon: Smartphone },
];

function FundTransfer() {
  const [mode, setMode] = useState("imps");
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ben = beneficiaries.find((b) => b.id === selected);

  const proceed = () => {
    if (!ben || !amount || !pwd) return;
    setLoading(true);
    setTimeout(() => {
      navigate({ to: "/fund-transfer/otp", search: { amt: amount, to: ben.name } });
    }, 900);
  };

  return (
    <AppLayout>
      <PageHeader title="Fund Transfer" subtitle="Send money securely to anyone, anywhere" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {modes.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${mode === m.id ? "border-primary bg-primary/5 shadow-elegant" : "border-border bg-card hover:border-primary/40"}`}>
            <m.icon className={`w-5 h-5 mb-2 ${mode === m.id ? "text-primary" : "text-muted-foreground"}`} />
            <div className="font-bold text-sm">{m.label}</div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <h2 className="font-bold mb-3">Saved Beneficiaries</h2>
          <div className="space-y-2">
            {beneficiaries.map((b) => (
              <motion.button key={b.id} whileHover={{ x: 4 }}
                onClick={() => setSelected(b.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selected === b.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/60"}`}>
                <div className="w-11 h-11 rounded-full bg-gradient-gold text-gold-foreground flex items-center justify-center font-bold">
                  {b.name.split(" ").map((p) => p[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.bank} · {b.acc} · Last: {b.last}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </Card>

        <Card className="p-5 h-fit sticky top-24">
          <h2 className="font-bold mb-1">Transfer Details</h2>
          <p className="text-xs text-muted-foreground mb-4">{ben ? `To: ${ben.name}` : "Select a beneficiary"}</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Amount (₹)</label>
              <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Remarks</label>
              <Input placeholder="e.g. Rent for May" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Transaction Password</label>
              <Input type="password" placeholder="" value={pwd} onChange={(e) => setPwd(e.target.value)} />
            </div>
            <Button disabled={!ben || !amount || !pwd || loading} onClick={proceed}
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
              {loading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Processing…</> : <>Proceed Securely <ArrowRight className="w-4 h-4 ml-1" /></>}
            </Button>
            <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-primary">Cancel</Link>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}