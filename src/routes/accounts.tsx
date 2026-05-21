import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { accounts } from "@/lib/banking-data";
import { Card } from "@/components/ui/card";
import { CreditCard, ChevronRight } from "lucide-react";
import { useProfilePanel } from "@/components/banking/ProfileContext";

export const Route = createFileRoute("/accounts")({ component: AccountsPage });

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

function AccountsPage() {
  const profilePanel = useProfilePanel();
  return (
    <AppLayout>
      <PageHeader title="All Accounts" subtitle="Manage all your linked accounts at one place" />
      <div className="grid sm:grid-cols-2 gap-4">
        {accounts.map((a) => (
          <Card key={a.id} className={`p-5 hover:shadow-elegant transition-all bg-gradient-to-br ${a.color} text-white border-0`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs opacity-70 uppercase tracking-wider">{a.type}</div>
                  <div className="font-mono text-sm mt-1">{a.masked}</div>
                </div>
                <CreditCard className="w-6 h-6 opacity-80" />
              </div>
              <div className="text-xs opacity-70">Available Balance</div>
              <div className="text-2xl font-bold flex items-center justify-between">
                {fmt(a.balance)}
                <button
                  onClick={profilePanel.open}
                  className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
                  aria-label="View account details"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/accounts/$id" params={{ id: a.id }} className="text-[11px] font-semibold bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full backdrop-blur transition-colors">
                  Mini Statement
                </Link>
                <button onClick={profilePanel.open} className="text-[11px] font-semibold bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full backdrop-blur transition-colors">
                  Full Details
                </button>
              </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}