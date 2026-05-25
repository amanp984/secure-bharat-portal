import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { Copy, Download, ShieldCheck, ArrowUpRight, ArrowDownLeft, Building2, User, Wallet, FileText } from "lucide-react";
import { StatementDownloadButton } from "@/components/banking/StatementDownloadButton";
import { toast } from "sonner";
import { accounts, transactions, profile } from "@/lib/banking-data";
import { motion } from "framer-motion";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

export function AccountDetailsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const acc = accounts[0];
  const copy = (val: string, label: string) => {
    navigator.clipboard?.writeText(val);
    toast.success(`${label} copied`);
  };

  const rows: { label: string; value: string; copyable?: boolean }[] = [
    { label: "Account Holder", value: profile.fullName },
    { label: "Account Number", value: acc.accountNumber, copyable: true },
    { label: "Account Type", value: acc.type },
    { label: "IFSC Code", value: acc.ifsc, copyable: true },
    { label: "MICR Code", value: profile.micr, copyable: true },
    { label: "Branch", value: profile.branch },
    { label: "Branch Address", value: profile.branchAddress },
    { label: "Customer ID", value: acc.customerId, copyable: true },
    { label: "Customer Category", value: profile.customerCategory },
    { label: "Account Status", value: acc.status },
    { label: "KYC Status", value: profile.kycStatus },
    { label: "Nominee", value: profile.nominee },
    { label: "Opened On", value: profile.openedOn },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Current Account Details</DialogTitle>
        </DialogHeader>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`relative p-5 text-white bg-gradient-to-br ${acc.color} overflow-hidden`}
        >
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start justify-between mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/70">Bharat Bank</div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                {acc.type}
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-semibold tracking-wider">PRIMARY</span>
              </h2>
              <div className="font-mono text-[12px] tracking-[0.25em] text-white/80 mt-1">{acc.masked}</div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-semibold">
              <ShieldCheck className="w-3 h-3" /> {acc.status}
            </span>
          </div>
          <div className="relative">
            <div className="text-[10px] uppercase tracking-widest text-white/60">Available Balance</div>
            <div className="text-3xl font-bold tracking-tight">{fmt(acc.balance)}</div>
          </div>
        </motion.div>

        <div className="p-5 space-y-5">
          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2">
            <Link to="/fund-transfer" onClick={() => onOpenChange(false)} className="border rounded-lg p-2.5 flex flex-col items-center gap-1 hover:border-primary/40 hover:shadow-sm transition-all text-[11px] font-semibold">
              <Wallet className="w-4 h-4 text-primary" /> Fund Transfer
            </Link>
            <Link to="/transactions" onClick={() => onOpenChange(false)} className="border rounded-lg p-2.5 flex flex-col items-center gap-1 hover:border-primary/40 hover:shadow-sm transition-all text-[11px] font-semibold">
              <FileText className="w-4 h-4 text-primary" /> Statement
            </Link>
            <StatementDownloadButton variant="outline" idleIcon={Download} idleLabel="Download PDF" loadingLabel="Generating..." className="h-auto min-h-[58px] flex-col gap-1 rounded-lg p-2.5 text-[11px] font-semibold shadow-none hover:border-primary/40 hover:shadow-sm" />
          </div>

          {/* Account info */}
          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-primary" /> Account Information</h3>
            <div className="border rounded-lg divide-y">
              {rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-3 px-3 py-2 text-[12px]">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-semibold text-right flex items-center gap-1.5 truncate">
                    {r.value}
                    {r.copyable && (
                      <button aria-label={`Copy ${r.label}`} onClick={() => copy(r.value, r.label)}>
                        <Copy className="w-3 h-3 text-muted-foreground hover:text-primary" />
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5"><User className="w-4 h-4 text-primary" /> Customer Details</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-[12px]">
              {[
                { l: "Mobile", v: profile.mobile },
                { l: "Email", v: profile.email },
                { l: "PAN", v: profile.pan },
                { l: "Aadhaar", v: profile.aadhaar },
                { l: "Occupation", v: profile.occupation },
                { l: "Address", v: profile.address },
              ].map((x) => (
                <div key={x.l} className="border rounded-lg px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{x.l}</div>
                  <div className="font-semibold">{x.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent transactions preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">Recent Transactions</h3>
              <Link to="/transactions" onClick={() => onOpenChange(false)} className="text-xs text-primary font-semibold hover:underline">View all →</Link>
            </div>
            <div className="border rounded-lg divide-y text-[12px]">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 px-3 py-2">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${t.type === "Credit" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {t.type === "Credit" ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{t.narration}</div>
                    <div className="text-[10px] text-muted-foreground">{t.date} · {t.id}</div>
                  </div>
                  <div className={`font-semibold whitespace-nowrap ${t.type === "Credit" ? "text-success" : "text-foreground"}`}>
                    {t.type === "Credit" ? "+" : "−"} {fmt(t.type === "Credit" ? t.credit : t.debit)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
