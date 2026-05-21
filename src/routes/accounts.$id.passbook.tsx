import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { transactions } from "@/lib/banking-data";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/accounts/$id/passbook")({ component: Passbook });

const fmt = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(Math.round(n));

function Passbook() {
  return (
    <AppLayout>
      <PageHeader title="M-Passbook" subtitle="Real-time digital passbook" />
      <div className="relative pl-6 border-l-2 border-dashed border-primary/30 space-y-4">
        {transactions.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="relative bg-card border rounded-2xl p-4 shadow-card-soft hover:shadow-elegant transition-shadow"
          >
            <div className={`absolute -left-[33px] top-5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-background ${t.type === "Credit" ? "bg-success" : "bg-destructive"}`}>
              {t.type === "Credit" ? <ArrowDownLeft className="w-3 h-3 text-white" /> : <ArrowUpRight className="w-3 h-3 text-white" />}
            </div>
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="font-semibold">{t.narration}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.date} · Ref {t.id}</div>
                <span className={`text-[10px] mt-2 inline-block px-2 py-0.5 rounded-full ${t.type === "Credit" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{t.type}</span>
              </div>
              <div className="text-right">
                <div className={`font-bold ${t.type === "Credit" ? "text-success" : "text-foreground"}`}>
                  {t.type === "Credit" ? "+" : "−"}{fmt(t.type === "Credit" ? t.credit : t.debit)}
                </div>
                <div className="text-xs text-muted-foreground">Bal {fmt(t.balance)}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}