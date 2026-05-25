import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { beneficiaries } from "@/lib/banking-data";
import {
  UserPlus, Trash2, Send, AlertTriangle, X, Search, BadgeCheck,
  Building2, Filter,
} from "lucide-react";
import { useBankingModal } from "@/components/banking/ModalContext";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const Route = createFileRoute("/beneficiary")({
  component: BeneficiaryPage,
  head: () => ({
    meta: [
      { title: "Manage Beneficiary — Indian Bank One" },
      { name: "description", content: "Search, filter and manage verified payment beneficiaries for IMPS, NEFT and RTGS transfers." },
      { property: "og:title", content: "Manage Beneficiary — Indian Bank One" },
      { property: "og:description", content: "Search, filter and manage verified payment beneficiaries for IMPS, NEFT and RTGS transfers." },
      { property: "og:url", content: "https://www.indianbankone.in/beneficiary" },
    ],
    links: [{ rel: "canonical", href: "https://www.indianbankone.in/beneficiary" }],
  }),
});

const categories = ["All", "Family", "Vendor", "Business"] as const;
const bankColor: Record<string, string> = {
  "HDFC Bank": "from-blue-600 to-blue-800",
  "Axis Bank": "from-rose-600 to-pink-700",
  "ICICI Bank": "from-orange-600 to-red-700",
  "SBI": "from-indigo-600 to-purple-700",
};
const beneficiaryCategory: Record<string, (typeof categories)[number]> = {
  b1: "Family",
  b2: "Business",
  b3: "Vendor",
};

function BeneficiaryPage() {
  const modal = useBankingModal();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const navigate = useNavigate();

  const filtered = useMemo(
    () =>
      beneficiaries.filter((b) => {
        const matchesQ =
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          b.bank.toLowerCase().includes(query.toLowerCase()) ||
          b.acc.toLowerCase().includes(query.toLowerCase());
        const matchesCat = cat === "All" || beneficiaryCategory[b.id] === cat;
        return matchesQ && matchesCat;
      }),
    [query, cat],
  );

  return (
    <AppLayout>
      <PageHeader
        title="Manage Beneficiary"
        subtitle={`${beneficiaries.length} verified payees · Last sync: just now`}
        action={
          <Button onClick={() => modal.show("beneficiary-restricted")} className="bg-gradient-primary text-primary-foreground">
            <UserPlus className="w-4 h-4 mr-1.5" />Add Beneficiary
          </Button>
        }
      />

      <Card className="p-3 mb-4 shadow-card-soft">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 h-9"
              placeholder="Search by name, bank or account number…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 border rounded-md p-0.5 bg-secondary/50">
            <Filter className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`h-7 px-2.5 text-[11px] font-bold rounded transition-all ${
                  cat === c ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {filtered.map((b, i) => {
            const grad = bankColor[b.bank] ?? "from-slate-600 to-slate-800";
            const category = beneficiaryCategory[b.id] ?? "Other";
            return (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="overflow-hidden shadow-card-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all group">
                  <div className={`h-1.5 bg-gradient-to-r ${grad}`} />
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold shadow-sm shrink-0`}>
                        {b.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <div className="font-bold truncate text-sm">{b.name}</div>
                          <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5" /> {b.bank}
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-foreground font-bold tracking-wider">
                        {category.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1 mb-3 p-2.5 rounded-md bg-secondary/40">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account</span>
                        <span className="font-mono font-semibold">{b.acc}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Transfer</span>
                        <span className="font-semibold">{b.last}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="inline-flex items-center gap-1 text-success font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Verified
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-95"
                        onClick={() => navigate({ to: "/fund-transfer", search: { beneficiary: b.id } })}
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />Quick Transfer
                      </Button>
                      <Button size="sm" variant="outline" aria-label="Delete beneficiary" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm text-muted-foreground">
            No beneficiaries match your search.
          </div>
        )}
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
