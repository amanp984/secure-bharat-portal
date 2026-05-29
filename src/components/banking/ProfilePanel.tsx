import { AnimatePresence, motion } from "framer-motion";
import {
  X, Copy, Download, ShieldCheck, BadgeCheck, User, CreditCard,
  Building2, Phone, Mail, Hash, FileText, MapPin, Calendar, Clock,
} from "lucide-react";
import { accounts, profile } from "@/lib/banking-data";
import { useCurrentBalance } from "@/hooks/useTransactions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function Row({ icon: Icon, label, value, copy }: { icon: any; label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/60 last:border-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-sm font-semibold text-foreground truncate">{value}</span>
        {copy && (
          <button
            onClick={() => { navigator.clipboard?.writeText(value); toast.success(`${label} copied`); }}
            className="text-muted-foreground hover:text-primary p-1 rounded-md hover:bg-primary/10"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export function ProfilePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const acc = accounts[0];
  const balance = useCurrentBalance();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-[91] w-full sm:w-[440px] bg-card shadow-2xl flex flex-col"
          >
            <div className="bg-gradient-to-br from-blue-800 via-indigo-800 to-slate-900 text-white p-5 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-xl font-bold ring-2 ring-white/20">
                    DS
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-white/70">Account Holder</div>
                    <div className="text-lg font-bold leading-tight">{profile.fullName}</div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-300 mt-0.5">
                      <BadgeCheck className="w-3 h-3" /> KYC Verified · {profile.accountStatus}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Account</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">Secure</span>
                </div>
                <div className="rounded-xl border bg-card px-3 shadow-card-soft">
                  <Row icon={User} label="Full Name" value={profile.fullName} />
                  <Row icon={Hash} label="Customer ID / CIF" value={profile.customerId} copy />
                  <Row icon={CreditCard} label="Account Number" value={profile.accountNumber} copy />
                  <Row icon={Building2} label="IFSC Code" value={profile.ifsc} copy />
                  <Row icon={Building2} label="Branch" value={profile.branch} />
                  <Row icon={User} label="Account Type" value={profile.accountType} />
                  <Row icon={Calendar} label="Account Opened" value={profile.openedOn} />
                  <Row icon={CreditCard} label="Available Balance" value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(acc.balance)} />
                  <Row icon={ShieldCheck} label="KYC Status" value={profile.kycStatus} />
                  <Row icon={BadgeCheck} label="Account Status" value={profile.accountStatus} />
                  <Row icon={User} label="Nominee" value={profile.nominee} />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">Contact</h3>
                <div className="rounded-xl border bg-card px-3 shadow-card-soft">
                  <Row icon={Phone} label="Registered Mobile" value={profile.mobile} />
                  <Row icon={Mail} label="Email" value={profile.email} />
                  <Row icon={MapPin} label="Address" value={profile.address} />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">KYC / Identity</h3>
                <div className="rounded-xl border bg-card px-3">
                  <Row icon={FileText} label="Aadhaar" value={profile.aadhaar} />
                  <Row icon={FileText} label="PAN" value={profile.pan} />
                  <Row icon={ShieldCheck} label="KYC Status" value={profile.kycStatus} />
                  <Row icon={User} label="Nominee" value={profile.nominee} />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">Branch</h3>
                <div className="rounded-xl border bg-card px-3">
                  <Row icon={Building2} label="Branch" value={profile.branch} />
                  <Row icon={MapPin} label="Address" value={profile.branchAddress} />
                </div>
              </section>

              <section>
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400 mt-0.5" />
                  <div className="text-[11px] text-amber-900 dark:text-amber-200">
                    <div className="font-semibold">Last Login</div>
                    <div>{profile.lastLogin}</div>
                  </div>
                </div>
              </section>
            </div>

            <div className="border-t p-4 bg-secondary/40 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => toast.success("Profile downloaded as PDF")}>
                <Download className="w-4 h-4 mr-1.5" /> Download
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-blue-700 to-indigo-700 text-white" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}