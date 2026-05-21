import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { accounts, transactions } from "@/lib/banking-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/accounts/$id")({ component: AccountDetails });

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

function AccountDetails() {
  const { id } = Route.useParams();
  const acc = accounts.find((a) => a.id === id) ?? accounts[0];
  const rows = [
    ["Full Name", "Arjun Ramesh Iyer"],
    ["CIF Number", "5489221"],
    ["IFSC Code", "BHAR0000123"],
    ["Branch", "Anna Nagar, Chennai"],
    ["Registered Mobile", "+91 98xxxxxx21"],
    ["Email", "arjun.r@example.com"],
    ["KYC Status", "Verified"],
    ["Account Status", "Active"],
    ["Nominee", "Lakshmi Iyer (Mother)"],
    ["Available Balance", fmt(acc.balance)],
    ["Ledger Balance", fmt(acc.balance + 1240)],
  ];
  return (
    <AppLayout>
      <PageHeader
        title={acc.type}
        subtitle={acc.masked}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success("PDF downloaded")}><Download className="w-4 h-4 mr-1" />PDF</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Print</Button>
            <Button variant="outline" onClick={() => toast.success("Share link copied")}><Share2 className="w-4 h-4 mr-1" />Share</Button>
          </div>
        }
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <h2 className="text-lg font-bold mb-4">Account Information</h2>
          <div className="divide-y">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between py-3 text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-semibold text-foreground">{v}</span>
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