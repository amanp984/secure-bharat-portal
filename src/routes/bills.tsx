import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Zap, Droplet, Flame, Wifi, Tv, Smartphone, CreditCard, Car, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/bills")({ component: BillsPage });

const billers = [
  { label: "Electricity", icon: Zap, color: "from-amber-400 to-orange-500" },
  { label: "Water", icon: Droplet, color: "from-sky-400 to-blue-500" },
  { label: "Gas", icon: Flame, color: "from-rose-400 to-red-500" },
  { label: "Broadband", icon: Wifi, color: "from-indigo-400 to-violet-500" },
  { label: "DTH", icon: Tv, color: "from-fuchsia-400 to-purple-500" },
  { label: "Mobile", icon: Smartphone, color: "from-emerald-400 to-teal-500" },
  { label: "Credit Card", icon: CreditCard, color: "from-slate-500 to-slate-700" },
  { label: "FASTag", icon: Car, color: "from-yellow-400 to-amber-500" },
];

function BillsPage() {
  return (
    <AppLayout>
      <PageHeader title="Bill Payments & Recharge" subtitle="Pay all your utility bills at one place" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {billers.map((b, i) => (
          <motion.button
            key={b.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            whileHover={{ y: -4 }}
            onClick={() => toast.success(`${b.label} biller opened`)}
            className="bg-card border rounded-2xl p-5 text-center shadow-card-soft hover:shadow-elegant transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
              <b.icon className="w-6 h-6 text-white" />
            </div>
            <div className="font-semibold text-sm">{b.label}</div>
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="font-bold mb-3">Saved Billers</h2>
          {["BSES Rajdhani — 12345678", "Airtel Broadband — 9876", "Mahanagar Gas — 4477"].map((s) => (
            <div key={s} className="flex items-center justify-between py-3 border-b last:border-0 text-sm">
              <span>{s}</span>
              <button onClick={() => toast.success("Payment initiated")} className="text-primary font-semibold hover:underline">Pay Now</button>
            </div>
          ))}
          <button className="text-sm text-primary font-semibold mt-3 flex items-center gap-1 hover:underline"><Plus className="w-3.5 h-3.5" />Add Biller</button>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold mb-3">Recent Payments</h2>
          {["Electricity — ₹2,340", "DTH — ₹599", "Mobile — ₹299"].map((s) => (
            <div key={s} className="flex justify-between py-3 border-b last:border-0 text-sm">
              <span>{s}</span><span className="text-xs text-success">Paid</span>
            </div>
          ))}
        </Card>
      </div>
    </AppLayout>
  );
}