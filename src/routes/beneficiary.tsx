import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { beneficiaries } from "@/lib/banking-data";
import { UserPlus, Trash2, Send, AlertTriangle, X } from "lucide-react";
import { useBankingModal } from "@/components/banking/ModalContext";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";

export const Route = createFileRoute("/beneficiary")({
  component: BeneficiaryPage,
  head: () => ({
    meta: [
      { title: "Beneficiaries — Bharat Bank" },
      { name: "description", content: "Add, manage and delete payment beneficiaries for IMPS, NEFT and RTGS transfers." },
      { property: "og:title", content: "Beneficiaries — Bharat Bank" },
      { property: "og:description", content: "Add, manage and delete payment beneficiaries for IMPS, NEFT and RTGS transfers." },
      { property: "og:url", content: "https://indbanksample.lovable.app/beneficiary" },
    ],
    links: [{ rel: "canonical", href: "https://indbanksample.lovable.app/beneficiary" }],
  }),
});

function BeneficiaryPage() {
  const modal = useBankingModal();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <AppLayout>
      <PageHeader title="Manage Beneficiary" subtitle="Your saved payees"
        action={<Button onClick={() => modal.show("beneficiary-restricted")} className="bg-gradient-primary"><UserPlus className="w-4 h-4 mr-1" />Add Beneficiary</Button>}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {beneficiaries.map((b) => (
          <Card key={b.id} className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-gold text-gold-foreground flex items-center justify-center font-bold">
                {b.name.split(" ").map((p) => p[0]).join("")}
              </div>
              <div>
                <div className="font-semibold">{b.name}</div>
                <div className="text-xs text-muted-foreground">{b.bank}</div>
              </div>
            </div>
            <div className="text-xs space-y-1 mb-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Account</span><span className="font-mono">{b.acc}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last Transfer</span><span>{b.last}</span></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-gradient-primary"><Send className="w-3.5 h-3.5 mr-1" />Quick Transfer</Button>
              <Button size="sm" variant="outline" aria-label="Delete beneficiary" onClick={() => setDeleteOpen(true)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>
      <AnimatePresence>
        {deleteOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setDeleteOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-elegant max-w-md w-full overflow-hidden border"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-destructive" />
                  </div>
                  <button onClick={() => setDeleteOpen(false)} aria-label="Close dialog" className="p-1 rounded-lg hover:bg-muted">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <h3 className="text-lg font-bold mb-2">Action Not Permitted</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This action cannot be completed through Net Banking. Please use Mobile Banking to manage beneficiaries.
                </p>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>Close</Button>
                  <Button className="flex-1 bg-gradient-primary text-primary-foreground" onClick={() => { setDeleteOpen(false); navigate({ to: "/" }); }}>
                    Return to Dashboard
                  </Button>
                </div>
              </div>
              <div className="h-1 bg-gradient-gold" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}