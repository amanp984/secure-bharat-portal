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

export const Route = createFileRoute("/cards")({
  component: CardsPage,
  head: () => ({
    meta: [
      { title: "Debit Cards — Bharat Bank" },
      { name: "description", content: "Manage your Bharat Bank debit card limits, controls, PIN and freeze settings." },
      { property: "og:title", content: "Debit Cards — Bharat Bank" },
      { property: "og:description", content: "Manage your Bharat Bank debit card limits, controls, PIN and freeze settings." },
      { property: "og:url", content: "https://indbanksample.lovable.app/cards" },
    ],
    links: [{ rel: "canonical", href: "https://indbanksample.lovable.app/cards" }],
  }),
});

function CardsPage() {
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

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-hero text-primary-foreground border-0 shadow-elegant relative overflow-hidden h-56">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="flex justify-between">
            <div className="text-xs uppercase tracking-widest opacity-70">Bharat Bank · RuPay Platinum Debit</div>
            <Wifi className="w-5 h-5 rotate-90 opacity-80" />
          </div>
          <div className="font-mono text-2xl mt-10 tracking-widest">5432 88•• •••• 4521</div>
          <div className="flex justify-between items-end mt-6 text-xs">
            <div><div className="opacity-70">Valid Thru</div><div className="font-semibold text-base">11 / 29</div></div>
            <div><div className="opacity-70">Holder</div><div className="font-semibold">ARJUN R IYER</div></div>
            <div className="text-xl font-extrabold tracking-tight"><span className="text-amber-300">Ru</span><span className="text-emerald-300">Pay</span></div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold mb-4">Card Controls</h2>
          <div className="space-y-4">
            {[
              { label: "Freeze / Unfreeze card", icon: ShieldOff, state: frozen, set: setFrozen },
              { label: "International usage", icon: Globe, state: intl, set: setIntl },
              { label: "Online transactions", icon: Wifi, state: online, set: setOnline },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3"><row.icon className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{row.label}</span></div>
                <Switch checked={row.state} onCheckedChange={(v) => { row.set(v); toast.success("Setting updated"); }} />
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
    </AppLayout>
  );
}