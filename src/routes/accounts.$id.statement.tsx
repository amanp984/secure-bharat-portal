import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { transactions } from "@/lib/banking-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileSpreadsheet, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/accounts/$id/statement")({ component: StatementPage });

const fmt = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(Math.round(n));
const PAGE = 10;

function StatementPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const filtered = transactions.filter((t) => t.narration.toLowerCase().includes(q.toLowerCase()) || t.id.includes(q));
  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));

  return (
    <AppLayout>
      <PageHeader
        title="Account Statement"
        subtitle="Full transaction history with filters & exports"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success("Excel exported")}><FileSpreadsheet className="w-4 h-4 mr-1" />Excel</Button>
            <Button className="bg-gradient-primary" onClick={() => toast.success("PDF downloaded")}><Download className="w-4 h-4 mr-1" />PDF</Button>
          </div>
        }
      />
      <Card className="p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by narration or reference id…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Input type="date" className="w-auto" />
        <Input type="date" className="w-auto" />
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Date", "Narration", "Reference", "Type", "Debit", "Credit", "Balance"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {paged.map((t) => (
                <tr key={t.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{t.date}</td>
                  <td className="px-4 py-3 font-medium">{t.narration}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.type === "Credit" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{t.type}</span>
                  </td>
                  <td className="px-4 py-3 text-destructive">{t.debit ? fmt(t.debit) : "—"}</td>
                  <td className="px-4 py-3 text-success">{t.credit ? fmt(t.credit) : "—"}</td>
                  <td className="px-4 py-3 font-semibold">{fmt(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t text-sm">
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
}