import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Wifi, KeyRound, Globe, ShieldOff, Download, AlertTriangle, CreditCard, X, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { profile, useBankingStore } from "@/lib/banking-data";

export const Route = createFileRoute("/cards")({
  component: CardsPage,
  head: () => ({
    meta: [
      { title: "Debit Cards — Indian One" },
      { name: "description", content: "Manage your Indian One debit card limits, controls, PIN and freeze settings." },
      { property: "og:title", content: "Debit Cards — Indian One" },
      { property: "og:description", content: "Manage your Indian One debit card limits, controls, PIN and freeze settings." },
      { property: "og:url", content: "https://www.indianone.in/cards" },
    ],
    links: [{ rel: "canonical", href: "https://www.indianone.in/cards" }],
  }),
});

function CardsPage() {
  useBankingStore();
  const [frozen, setFrozen] = useState(false);
  const [intl, setIntl] = useState(false);
  const [online, setOnline] = useState(true);
  const [limit, setLimit] = useState([50000]);
  const [securityOpen, setSecurityOpen] = useState<"freeze" | "unfreeze" | null>(null);
  const [otp, setOtp] = useState("");
  const [reason, setReason] = useState("Security Concern");
  const [timer, setTimer] = useState(55);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!securityOpen || timer <= 0) return;
    const id = setTimeout(() => setTimer((value) => value - 1), 1000);
    return () => clearTimeout(id);
  }, [securityOpen, timer]);

  const openSecurity = (nextFrozen: boolean) => {
    setSecurityOpen(nextFrozen ? "freeze" : "unfreeze");
    setOtp("");
    setReason("Security Concern");
    setTimer(55);
    setDone(false);
  };

  const submitSecurity = () => {
    if (otp.length !== 6) return toast.error("Enter 6-digit OTP");
    setFrozen(securityOpen === "freeze");
    setDone(true);
  };

  return (
    <AppLayout>
      <PageHeader title="Cards" subtitle="Manage your debit & credit cards" />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white border-0 shadow-elegant relative overflow-hidden h-56">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,.18),transparent)] opacity-50" />
          <div className="flex justify-between">
            <div className="text-xs uppercase tracking-widest opacity-70">Indian One · RuPay Platinum Debit</div>
            <Wifi className="w-5 h-5 rotate-90 opacity-80" />
          </div>
          <div className="mt-7 w-10 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-500 to-yellow-700 shadow-inner border border-amber-200/50" />
          <div className="font-mono text-2xl mt-5 tracking-widest">{`5432 88•• •••• ${(profile.accountNumber || "").slice(-4)}`}</div>
          <div className="flex justify-between items-end mt-6 text-xs">
            <div><div className="opacity-70">Valid Thru</div><div className="font-semibold text-base">11 / 29</div></div>
            <div><div className="opacity-70">Holder</div><div className="font-semibold">{(profile.cardholderName || profile.fullName).toUpperCase()}</div></div>
            <div className="text-xl font-extrabold tracking-tight"><span className="text-amber-300">Ru</span><span className="text-emerald-300">Pay</span></div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold mb-4">Card Controls</h2>
          <div className="space-y-4">
              {[
                { label: frozen ? "Unfreeze card" : "Freeze card", icon: ShieldOff, state: frozen, set: openSecurity },
              { label: "International usage", icon: Globe, state: intl, set: setIntl },
              { label: "Online transactions", icon: Wifi, state: online, set: setOnline },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3"><row.icon className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{row.label}</span></div>
                <Switch checked={row.state} onCheckedChange={(v) => { row.set(v); if (row.label !== "Freeze card" && row.label !== "Unfreeze card") toast.success("Setting updated"); }} />
              </div>
            ))}
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="flex justify-between text-sm font-medium mb-3"><span>Daily Limit</span><span className="text-primary font-bold">₹{limit[0].toLocaleString("en-IN")}</span></div>
              <Slider value={limit} onValueChange={setLimit} max={200000} step={1000} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" onClick={() => toast("Enter old PIN")}><KeyRound className="w-4 h-4 mr-1" />Change PIN</Button>
              <Button variant="outline" onClick={() => toast.success("Statement downloaded")}><Download className="w-4 h-4 mr-1" />Statement</Button>
              <Button variant="outline" className="col-span-2 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => toast.success("Card reported lost. Replacement card will be dispatched.")}>
                <AlertTriangle className="w-4 h-4 mr-1" />Report Lost / Block Card
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <AnimatePresence>
        {securityOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSecurityOpen(null)}>
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ type: "spring", damping: 22 }} onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl border shadow-elegant max-w-md w-full overflow-hidden">
              <div className="bg-gradient-primary text-primary-foreground p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold"><CreditCard className="w-5 h-5" /> Card Security Verification</div>
                <button onClick={() => setSecurityOpen(null)} className="p-1 rounded-md hover:bg-white/10" aria-label="Close"><X className="w-4 h-4" /></button>
              </div>
              {done ? (
                <div className="p-6 text-center">
                  <CheckCircle2 className="w-14 h-14 mx-auto text-success mb-3" />
                  <h3 className="text-lg font-bold mb-2">Request Submitted</h3>
                  <p className="text-sm text-muted-foreground">You will receive further updates shortly from your branch.</p>
                  <Button className="mt-5 w-full bg-gradient-primary text-primary-foreground" onClick={() => setSecurityOpen(null)}>Close</Button>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div><label className="text-xs text-muted-foreground">Enter OTP</label><input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1 w-full h-10 rounded-md border bg-background px-3 font-mono tracking-[0.5em]" placeholder="000000" /></div>
                  <div><label className="text-xs text-muted-foreground">Select Reason</label><select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm">{["Lost Card", "Security Concern", "Temporary Block", "Suspicious Activity"].map((r) => <option key={r}>{r}</option>)}</select></div>
                  <div className="text-xs text-muted-foreground">Resend OTP available in <span className="font-bold text-primary">00:{timer.toString().padStart(2, "0")}</span></div>
                  <Button className="w-full bg-gradient-primary text-primary-foreground" onClick={submitSecurity}>Submit Secure Request</Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}