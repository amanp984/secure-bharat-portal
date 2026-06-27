import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, Copy, Download, ShieldCheck, BadgeCheck, User, CreditCard,
  Building2, Phone, Mail, Hash, FileText, MapPin, Calendar, Clock,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useCurrentBalance } from "@/hooks/useTransactions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function Row({
  icon: Icon,
  label,
  value,
  copy,
  breakAll,
}: {
  icon: any;
  label: string;
  value: string;
  copy?: boolean;
  breakAll?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border/60 last:border-0">
      <div className="flex items-center gap-2.5 min-w-0 shrink-0 max-w-[40%]">
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs text-muted-foreground truncate">{label}</span>
      </div>
      <div className="flex items-start gap-1.5 min-w-0 flex-1 justify-end">
        <span
          className={
            "text-sm font-semibold text-foreground text-right min-w-0 " +
            (breakAll
              ? "break-words [overflow-wrap:anywhere] whitespace-normal"
              : "break-words whitespace-normal")
          }
          style={{ wordBreak: breakAll ? "break-word" : "normal" }}
        >
          {value}
        </span>
        {copy && (
          <button
            onClick={() => {
              navigator.clipboard?.writeText(value);
              toast.success(`${label} copied`);
            }}
            className="text-muted-foreground hover:text-primary p-1 rounded-md hover:bg-primary/10 shrink-0"
            aria-label={`Copy ${label}`}
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

function ProfileBody({ onClose }: { onClose: () => void }) {
  const balance = useCurrentBalance();
  const profile = useProfile();
  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-800 via-indigo-800 to-slate-900 text-white p-5 relative overflow-hidden shrink-0">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-xl font-bold ring-2 ring-white/20 shrink-0">
              {profile.initials}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-white/70">
                Account Holder
              </div>
              <div className="text-lg font-bold leading-tight truncate">
                {profile.fullName}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-300 mt-0.5">
                <BadgeCheck className="w-3 h-3" /> KYC Verified · {profile.accountStatus}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 shrink-0"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-5 min-h-0">
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Account
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">
              Secure
            </span>
          </div>
          <div className="rounded-xl border bg-card px-3 shadow-card-soft">
            <Row icon={User} label="Full Name" value={profile.fullName} />
            <Row icon={Hash} label="Customer ID / CIF" value={profile.customerId} copy />
            <Row icon={CreditCard} label="Account Number" value={profile.accountNumber} copy />
            <Row icon={Building2} label="IFSC Code" value={profile.ifsc} copy />
            <Row icon={Building2} label="Branch" value={profile.branch} />
            <Row icon={User} label="Account Type" value={profile.accountType} />
            <Row icon={Calendar} label="Account Opened" value={profile.openedOn} />
            <Row
              icon={CreditCard}
              label="Available Balance"
              value={new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(balance)}
            />
            <Row icon={ShieldCheck} label="KYC Status" value={profile.kycStatus} />
            <Row icon={BadgeCheck} label="Account Status" value={profile.accountStatus} />
            <Row icon={User} label="Nominee" value={profile.nominee} breakAll />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">
            Contact
          </h3>
          <div className="rounded-xl border bg-card px-3 shadow-card-soft">
            <Row icon={Phone} label="Registered Mobile" value={profile.mobile} />
            <Row icon={Mail} label="Email" value={profile.email} breakAll />
            <Row icon={MapPin} label="Address" value={profile.address} breakAll />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">
            KYC / Identity
          </h3>
          <div className="rounded-xl border bg-card px-3">
            <Row icon={FileText} label="Aadhaar" value={profile.aadhaar} />
            <Row icon={FileText} label="PAN" value={profile.pan} />
            <Row icon={ShieldCheck} label="KYC Status" value={profile.kycStatus} />
            <Row icon={User} label="Nominee" value={profile.nominee} breakAll />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">
            Branch
          </h3>
          <div className="rounded-xl border bg-card px-3">
            <Row icon={Building2} label="Branch" value={profile.branch} />
            <Row icon={MapPin} label="Address" value={profile.branchAddress} breakAll />
          </div>
        </section>

        <section>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-[11px] text-amber-900 dark:text-amber-200 min-w-0 break-words">
              <div className="font-semibold">Last Login</div>
              <div>{profile.lastLogin}</div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t p-4 bg-secondary/40 flex gap-2 shrink-0">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => toast.success("Profile downloaded as PDF")}
        >
          <Download className="w-4 h-4 mr-1.5" /> Download
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-blue-700 to-indigo-700 text-white"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </>
  );
}

export function ProfilePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const isDesktop = useIsDesktop();

  // Lock background scroll while open on mobile
  useEffect(() => {
    if (!open || isDesktop) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isDesktop]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
        (isDesktop ? (
          <>
            {/* Click-outside catcher (transparent) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90]"
              onClick={onClose}
            />
            {/* Dropdown anchored under navbar, right-aligned */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed right-4 top-16 z-[91] w-[400px] max-w-[calc(100vw-2rem)] max-h-[80vh] bg-card rounded-2xl shadow-2xl border flex flex-col overflow-hidden"
              role="dialog"
              aria-label="Profile"
            >
              <ProfileBody onClose={onClose} />
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.aside
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) onClose();
              }}
              className="fixed left-1/2 -translate-x-1/2 bottom-0 z-[91] w-[95vw] max-h-[90vh] h-auto bg-card rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Profile"
            >
              <div className="flex justify-center pt-2 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
              </div>
              <ProfileBody onClose={onClose} />
            </motion.aside>
          </>
        ))}
    </AnimatePresence>
  );
}
