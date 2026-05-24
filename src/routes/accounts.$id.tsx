import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { accounts, transactions, profile } from "@/lib/banking-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/accounts/$id")({
  component: AccountDetails,
  head: ({ params }) => {
    const url = `https://indbanksample.lovable.app/accounts/${params.id}`;
    const title = `Account ${params.id.toUpperCase()} — Bharat Bank`;
    const desc = `View account ${params.id.toUpperCase()} details, balance, IFSC, branch and recent transactions on Bharat Bank.`;
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

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

function AccountDetails() {
  const { id } = Route.useParams();
  const acc = accounts.find((a) => a.id === id) ?? accounts[0];
  const rows = [
    ["Account Number", profile.accountNumber],
    ["CIF", profile.customerId],
    ["IFSC", profile.ifsc],
    ["Branch", profile.branch],
    ["Account Type", profile.accountType],
    ["Available Balance", fmt(acc.balance)],
    ["Ledger Balance", fmt(acc.balance + 1240)],
    ["Registered Mobile", profile.mobile],
    ["Email", profile.email],
    ["Aadhaar", profile.aadhaar],
    ["PAN", profile.pan],
    ["Nominee", profile.nominee],
    ["Address", profile.address],
    ["KYC Status", profile.kycStatus],
    ["Opening Date", profile.openedOn],
  ];
  return (
    <AppLayout>
      <PageHeader
        title={acc.type}
        subtitle={acc.masked}
        action={
          <div className="flex gap-2">
            <Link to="/accounts/$id/statement" params={{ id }}><Button variant="outline"><Download className="w-4 h-4 mr-1" />Statement</Button></Link>
            <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Print</Button>
            <Button variant="outline" onClick={() => toast.success("Share link copied")}><Share2 className="w-4 h-4 mr-1" />Share</Button>
          </div>
        }
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4 shadow-card-soft">
          <h2 className="text-base font-bold mb-3">Professional Current Account Details</h2>
          <div className="grid sm:grid-cols-2 gap-x-5 divide-y sm:divide-y-0">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-2.5 text-sm border-b border-border/70">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-semibold text-foreground text-right">{v}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-bold mb-3">Last Transactions</h2>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="text-sm">
                <div className="flex justify-between">
                  <span className="font-medium truncate">{t.narration}</span>
                  <span className={t.type === "Credit" ? "text-success" : "text-destructive"}>
                    {t.type === "Credit" ? "+" : "−"}{fmt(t.type === "Credit" ? t.credit : t.debit)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{t.date}</div>
              </div>
            ))}
          </div>
          <Link to="/accounts/$id/statement" params={{ id }}>
            <Button className="w-full mt-4" variant="outline"><FileText className="w-4 h-4 mr-1" />Full Statement</Button>
          </Link>
        </Card>
      </div>
    </AppLayout>
  );
}