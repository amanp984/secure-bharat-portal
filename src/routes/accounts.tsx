import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { accounts } from "@/lib/banking-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ChevronRight, ArrowRightLeft, FileText, Info, PiggyBank, Wallet, Plus, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useProfilePanel } from "@/components/banking/ProfileContext";
import { toast } from "sonner";

export const Route = createFileRoute("/accounts")({
  component: AccountsPage,
  head: () => ({
    meta: [
      { title: "All Accounts — Bharat Bank" },
      { name: "description", content: "View and manage all your linked Bharat Bank current, savings and salary accounts at one place." },
      { property: "og:title", content: "All Accounts — Bharat Bank" },
      { property: "og:description", content: "View and manage all your linked Bharat Bank current, savings and salary accounts at one place." },
      { property: "og:url", content: "https://indbanksample.lovable.app/accounts" },
    ],
    links: [{ rel: "canonical", href: "https://indbanksample.lovable.app/accounts" }],
  }),
});

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

function EmptyAccountCard({
  type,
  icon: Icon,
  message,
  accent,
}: {
  type: string;
  icon: typeof PiggyBank;
  message: string;
  accent: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-4 border-dashed border-2 bg-gradient-to-br from-card to-secondary/30 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg ${accent} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Bharat Bank</div>
              <div className="text-sm font-bold text-foreground">{type}</div>
            </div>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">INACTIVE</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
            <Info className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-sm font-semibold text-foreground">{message}</div>
          <div className="text-[11px] text-muted-foreground mt-1 max-w-xs">
            You can open a new {type.toLowerCase()} instantly through Bharat Bank Net Banking.
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => toast("Opening account application form…")}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Open {type}
        </Button>
      </Card>
    </motion.div>
  );
}

function AccountsPage() {
  const profilePanel = useProfilePanel();
  return (
    <AppLayout>
      <PageHeader title="All Accounts" subtitle="Manage all your linked Bharat Bank accounts in one place" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Active Current Account */}
        {accounts.map((a) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`relative rounded-xl p-4 text-white shadow-md bg-gradient-to-br ${a.color} overflow-hidden h-full flex flex-col`}>
              <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-start justify-between mb-3">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-white/60">Bharat Bank</div>
                  <div className="text-sm font-bold flex items-center gap-1.5">
                    {a.type}
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-semibold tracking-wider">PRIMARY</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-semibold">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> {a.status}
                </span>
              </div>
              <div className="relative">
                <div className="font-mono text-[11px] tracking-[0.25em] text-white/85">{a.masked}</div>
                <div className="text-[9px] uppercase tracking-widest text-white/55 mt-2">Available Balance</div>
                <div className="text-2xl font-bold tracking-tight">{fmt(a.balance)}</div>
              </div>
              <div className="relative grid grid-cols-2 gap-1.5 text-[10px] border-t border-white/15 pt-2 mt-3">
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-white/50">IFSC</div>
                  <div className="font-semibold">{a.ifsc}</div>
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-white/50">Branch</div>
                  <div className="font-semibold truncate">{a.branch}</div>
                </div>
              </div>
              <div className="relative mt-3 grid grid-cols-3 gap-1.5">
                <Link
                  to="/fund-transfer"
                  className="flex items-center justify-center gap-1 text-[10.5px] font-semibold bg-white/15 hover:bg-white/25 px-2 py-1.5 rounded-md backdrop-blur transition-colors"
                >
                  <ArrowRightLeft className="w-3 h-3" /> Transfer
                </Link>
                <Link
                  to="/accounts/$id/statement"
                  params={{ id: a.id }}
                  className="flex items-center justify-center gap-1 text-[10.5px] font-semibold bg-white/15 hover:bg-white/25 px-2 py-1.5 rounded-md backdrop-blur transition-colors"
                >
                  <FileText className="w-3 h-3" /> Mini Stmt
                </Link>
                <button
                  onClick={profilePanel.open}
                  className="flex items-center justify-center gap-1 text-[10.5px] font-semibold bg-white/15 hover:bg-white/25 px-2 py-1.5 rounded-md backdrop-blur transition-colors"
                >
                  Full <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty states */}
        <EmptyAccountCard
          type="Savings Account"
          icon={PiggyBank}
          message="No Savings Account Found"
          accent="bg-gradient-to-br from-emerald-600 to-teal-700"
        />
        <EmptyAccountCard
          type="Salary Account"
          icon={Wallet}
          message="No Salary Account Found"
          accent="bg-gradient-to-br from-purple-600 to-indigo-700"
        />
      </div>

      <Card className="mt-4 p-3 flex items-center gap-2 text-[11px] text-muted-foreground bg-secondary/30">
        <ShieldCheck className="w-4 h-4 text-success shrink-0" />
        Your account balances are protected under DICGC up to ₹5,00,000. All transactions are monitored 24×7 for security.
      </Card>
    </AppLayout>
  );
}
