import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Zap, Droplet, Flame, Wifi, Smartphone, CreditCard, Car, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/bills")({
  component: BillsPage,
  head: () => ({
    meta: [
      { title: "Bill Payments & Recharge — Indian Bank One" },
      { name: "description", content: "Pay electricity, water, gas, broadband, mobile, credit card and FASTag bills securely." },
      { property: "og:title", content: "Bill Payments & Recharge — Indian Bank One" },
      { property: "og:description", content: "Pay electricity, water, gas, broadband, mobile, credit card and FASTag bills securely." },
      { property: "og:url", content: "https://www.indianbankone.in/bills" },
    ],
    links: [{ rel: "canonical", href: "https://www.indianbankone.in/bills" }],
  }),
});

const billers = [
  { label: "Electricity", icon: Zap, color: "from-amber-400 to-orange-500", providers: ["Tata Power", "Adani Electricity", "MSEB", "BSES Rajdhani"], idLabel: "Consumer Number" },
  { label: "Water", icon: Droplet, color: "from-sky-400 to-blue-500", providers: ["Delhi Jal Board", "BWSSB Bengaluru", "Mumbai Municipal"], idLabel: "Connection Number" },
  { label: "Gas", icon: Flame, color: "from-rose-400 to-red-500", providers: ["Mahanagar Gas", "Indraprastha Gas", "Gujarat Gas"], idLabel: "BP / Customer Number" },
  { label: "Broadband", icon: Wifi, color: "from-indigo-400 to-violet-500", providers: ["Airtel Fiber", "Jio Fiber", "ACT Fibernet"], idLabel: "User ID / Account No." },
  { label: "Mobile", icon: Smartphone, color: "from-emerald-400 to-teal-500", providers: ["Airtel", "Jio", "Vi", "BSNL"], idLabel: "Mobile Number" },
  { label: "Credit Card", icon: CreditCard, color: "from-slate-500 to-slate-700", providers: ["HDFC Bank", "ICICI Bank", "Axis Bank", "SBI Card"], idLabel: "Card Number" },
  { label: "FASTag", icon: Car, color: "from-yellow-400 to-amber-500", providers: ["ICICI FASTag", "Paytm FASTag", "NHAI FASTag", "HDFC FASTag"], idLabel: "Vehicle Number" },
];

type Biller = (typeof billers)[number];
type Step = "list" | "form" | "confirm" | "otp" | "success";

function BillsPage() {
  const [step, setStep] = useState<Step>("list");
  const [biller, setBiller] = useState<Biller | null>(null);
  const [provider, setProvider] = useState("");
  const [consumerId, setConsumerId] = useState("");
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(55);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (step !== "otp") return;
    setSeconds(55);
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step]);

  const openBiller = (b: Biller) => {
    setBiller(b); setProvider(""); setConsumerId(""); setAmount(""); setOtp("");
    setStep("form");
  };

  const reset = () => { setStep("list"); setBiller(null); };

  if (step === "list") {
    return (
      <AppLayout>
        <PageHeader title="Bill Payments & Recharge" subtitle="Pay all your utility bills at one place" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {billers.map((b, i) => (
            <motion.button
              key={b.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              onClick={() => openBiller(b)}
              className="bg-card border rounded-2xl p-5 text-center shadow-card-soft hover:shadow-elegant transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                <b.icon className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-sm">{b.label}</div>
            </motion.button>
          ))}
        </div>
      </AppLayout>
    );
  }

  if (!biller) return null;

  return (
    <AppLayout>
      <button onClick={reset} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to billers
      </button>

      <div className="max-w-xl mx-auto">
        <Card className="overflow-hidden">
          <div className={`bg-gradient-to-br ${biller.color} text-white p-5 flex items-center gap-3`}>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <biller.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/70">Pay Bill</div>
              <div className="text-lg font-bold">{biller.label}</div>
            </div>
          </div>

          {step === "form" && (
            <div className="p-5 space-y-4">
              <div>
                <label htmlFor="bill-provider" className="text-xs text-muted-foreground">Select Provider</label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger id="bill-provider" aria-label="Select provider"><SelectValue placeholder="Choose provider" /></SelectTrigger>
                  <SelectContent>
                    {biller.providers.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="bill-consumer-id" className="text-xs text-muted-foreground">{biller.idLabel}</label>
                <Input id="bill-consumer-id" value={consumerId} onChange={(e) => setConsumerId(e.target.value)} placeholder={`Enter ${biller.idLabel.toLowerCase()}`} />
              </div>
              <div>
                <label htmlFor="bill-amount" className="text-xs text-muted-foreground">Amount (₹)</label>
                <Input id="bill-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </div>
              <Button
                disabled={!provider || !consumerId || !amount}
                onClick={() => setStep("confirm")}
                className="w-full bg-gradient-primary text-primary-foreground"
              >
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {step === "confirm" && (
            <div className="p-5">
              <h3 className="font-bold mb-3">Confirm Payment</h3>
              <div className="rounded-xl border bg-secondary/30 divide-y text-sm">
                {[
                  ["Biller", biller.label],
                  ["Provider", provider],
                  [biller.idLabel, consumerId],
                  ["Amount", `₹ ${Number(amount).toLocaleString("en-IN")}`],
                  ["Convenience Fee", "₹ 0.00"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2.5">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-3">
                <ShieldCheck className="w-3.5 h-3.5 text-success" /> Secured by Indian Bank One · 256-bit SSL
              </div>
              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>Edit</Button>
                <Button className="flex-1 bg-gradient-primary text-primary-foreground" onClick={() => setStep("otp")}>
                  Confirm & Pay
                </Button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="p-5">
              <h3 className="font-bold mb-1">OTP Verification</h3>
              <p className="text-xs text-muted-foreground mb-4">
                We have sent a 6-digit OTP to your registered mobile +91 98xxxxxx21
              </p>
              <Input
                aria-label="One-time password"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                inputMode="numeric"
                className="text-center tracking-[0.5em] text-lg font-bold"
              />
              <div className="flex items-center justify-between text-[11px] mt-2">
                <span className="text-muted-foreground">Time remaining: <span className="font-bold text-foreground">00:{seconds.toString().padStart(2, "0")}</span></span>
                <button
                  disabled={seconds > 0}
                  onClick={() => setSeconds(55)}
                  className="text-primary font-semibold disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </div>
              <Button
                disabled={otp.length !== 6 || processing}
                onClick={() => {
                  setProcessing(true);
                  setTimeout(() => { setProcessing(false); setStep("success"); }, 1100);
                }}
                className="w-full mt-5 bg-gradient-primary text-primary-foreground"
              >
                {processing ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Processing…</> : "Verify & Pay"}
              </Button>
            </div>
          )}

          {step === "success" && (
            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                className="w-16 h-16 mx-auto rounded-full bg-success/15 flex items-center justify-center mb-3"
              >
                <CheckCircle2 className="w-9 h-9 text-success" />
              </motion.div>
              <h3 className="text-lg font-bold">Payment Successful</h3>
              <p className="text-xs text-muted-foreground mt-1">
                ₹ {Number(amount).toLocaleString("en-IN")} paid to {provider} ({biller.label})
              </p>
              <div className="rounded-xl border bg-secondary/30 mt-4 text-[12px] divide-y">
                <div className="flex justify-between px-4 py-2"><span className="text-muted-foreground">Reference</span><span className="font-mono">TXN{Math.floor(Math.random() * 9e6 + 1e6)}</span></div>
                <div className="flex justify-between px-4 py-2"><span className="text-muted-foreground">Status</span><span className="text-success font-semibold">Completed</span></div>
              </div>
              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="flex-1" onClick={reset}>Pay another bill</Button>
                <Button className="flex-1 bg-gradient-primary text-primary-foreground" onClick={() => { toast.success("Receipt downloaded"); reset(); }}>
                  Download Receipt
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}