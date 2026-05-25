import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { StatementDownloadButton } from "@/components/banking/StatementDownloadButton";
import { accounts, transactions, profile } from "@/lib/banking-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download, Share2, FileText, Send, Copy, ShieldCheck,
  BadgeCheck, Building2, User, Wallet, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/accounts/$id")({
  component: AccountDetails,
  head: ({ params }) => {
    const url = `https://www.indianbankone.in/accounts/${params.id}`;
    const title = `Account Details — Indian Bank One`;
    const desc = `View Indian Bank One account ${params.id.toUpperCase()} — balance, IFSC, branch, KYC details and nominee information.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

function Row({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border/60 last:border-0 text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground text-right flex items-center gap-1.5">
        {value}
        {copyable && (
          <button
            onClick={() => { navigator.clipboard?.writeText(value); toast.success(`${label} copied`); }}
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label={`Copy ${label}`}
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </span>
    </div>
  );
}

function AccountDetails() {
  const { id } = Route.useParams();
  const acc = accounts.find((a) => a.id === id) ?? accounts[0];

  return (
    <AppLayout>
      <PageHeader
        title="Account Details"
        subtitle={`${acc.type} · ${acc.masked}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied"); }}>
              <Share2 className="w-3.5 h-3.5 mr-1" />Share
            </Button>
            <StatementDownloadButton size="sm" className="bg-gradient-primary text-primary-foreground" idleIcon={Download} idleLabel="Download Statement" loadingLabel="Generating Statement..." />
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Account Summary hero card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <div className={`relative rounded-2xl p-5 text-white shadow-elegant bg-gradient-to-br ${acc.color} overflow-hidden`}>
            <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-10 -bottom-16 w-44 h-44 rounded-full bg-amber-300/10 blur-2xl" />
            <div className="relative flex items-start justify-between mb-4">
              <div>
                <div className="text-[9px] uppercase tracking-[0.25em] text-white/60">Indian Bank One</div>
                <div className="text-lg font-bold flex items-center gap-2 mt-0.5">
                  {acc.type}
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-bold tracking-wider">PRIMARY</span>
                  <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-bold">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> {acc.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-widest text-white/55">Customer ID</div>
                <div className="text-sm font-bold font-mono">{profile.customerId}</div>
              </div>
            </div>

            <div className="font-mono text-sm tracking-[0.3em] text-white/85 mb-3">{acc.masked}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/55">Available Balance</div>
            <div className="text-3xl font-bold tracking-tight mb-4">{fmt(acc.balance)}</div>

            <div className="grid grid-cols-3 gap-3 text-[11px] border-t border-white/15 pt-3 mb-4">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-white/50">IFSC</div>
                <div className="font-semibold">{acc.ifsc}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-white/50">Branch</div>
                <div className="font-semibold truncate">{acc.branch}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-white/50">Opened On</div>
                <div className="font-semibold">{profile.openedOn}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <StatementDownloadButton size="sm" variant="secondary" className="bg-white/15 hover:bg-white/25 text-white border-0" idleIcon={Download} idleLabel="Statement" loadingLabel="Generating..." />
              <Link to="/transactions">
                <Button size="sm" variant="secondary" className="w-full bg-white/15 hover:bg-white/25 text-white border-0">
                  <FileText className="w-3.5 h-3.5 mr-1" />Transactions
                </Button>
              </Link>
              <Link to="/fund-transfer">
                <Button size="sm" variant="secondary" className="w-full bg-amber-400/90 hover:bg-amber-400 text-slate-900 border-0 font-bold">
                  <Send className="w-3.5 h-3.5 mr-1" />Transfer
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Last Transactions side card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="p-4 shadow-card-soft h-full">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" />Recent Activity</h2>
              <Link to="/transactions" className="text-[11px] text-primary font-semibold hover:underline">View all</Link>
            </div>
            <div className="space-y-2.5">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="text-[12px] flex items-start justify-between gap-2 pb-2 border-b border-border/50 last:border-0">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{t.narration}</div>
                    <div className="text-[10px] text-muted-foreground">{t.date}</div>
                  </div>
                  <span className={`font-bold whitespace-nowrap ${t.type === "Credit" ? "text-success" : "text-destructive"}`}>
                    {t.type === "Credit" ? "+" : "−"}{fmt(t.type === "Credit" ? t.credit : t.debit)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Account Information */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-4">
        <Card className="p-5 shadow-card-soft">
          <div className="flex items-center justify-between mb-4 pb-3 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Account Information</h2>
                <p className="text-[10.5px] text-muted-foreground">Verified customer profile and KYC details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-bold">
                <BadgeCheck className="w-3 h-3" /> Security Verified
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                <ShieldCheck className="w-3 h-3" /> {profile.customerCategory}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-3 h-3" /> Account Identity
              </div>
              <Row label="Full Name" value={profile.fullName} />
              <Row label="CIF ID" value={profile.customerId} copyable />
              <Row label="Account Number" value={profile.accountNumber} copyable />
              <Row label="IFSC Code" value={profile.ifsc} copyable />
              <Row label="MICR Code" value={profile.micr} copyable />
              <Row label="Account Type" value={profile.accountType} />
              <Row label="Account Status" value={profile.accountStatus} />
              <Row label="KYC Status" value={profile.kycStatus} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5 mt-4 md:mt-0 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Branch & Contact
              </div>
              <Row label="Branch Name" value={profile.branch} />
              <Row label="Branch Address" value={profile.branchAddress} />
              <Row label="Registered Mobile" value={profile.mobile} />
              <Row label="Email" value={profile.email} copyable />
              <Row label="Aadhaar (masked)" value={profile.aadhaar} />
              <Row label="PAN (masked)" value={profile.pan} />
              <Row label="Occupation" value={profile.occupation} />
              <Row label="Customer Category" value={profile.customerCategory} />
            </div>
          </div>

          <div className="mt-5 grid md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50 border">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Communication Address</div>
              <div className="text-[12.5px] font-medium">{profile.address}</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Nominee</div>
              <div className="text-[12.5px] font-medium">{profile.nominee}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-muted-foreground border-t pt-3">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              All details are AES-256 encrypted and verified against bank records.
            </span>
            <span>Last updated: {profile.lastLogin}</span>
          </div>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
