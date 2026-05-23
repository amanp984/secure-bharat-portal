import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { transactions } from "@/lib/banking-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileSpreadsheet, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { profile } from "@/lib/banking-data";

export const Route = createFileRoute("/accounts/$id/statement")({
  component: StatementPage,
  head: ({ params }) => {
    const url = `https://indbanksample.lovable.app/accounts/${params.id}/statement`;
    const title = `Account Statement — Bharat Bank`;
    const desc = `Download and search full account statement with date filters and export to CSV or PDF.`;
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

const fmt = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(Math.round(n));
const PAGE = 10;

function downloadBlob(content: string, mime: string, filename: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function StatementPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const filtered = transactions.filter((t) => {
    const matchesQ = t.narration.toLowerCase().includes(q.toLowerCase()) || t.id.includes(q);
    return matchesQ;
  });
  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));

  const exportCSV = () => {
    const headers = ["Date", "Narration", "Reference", "Type", "Debit", "Credit", "Balance"];
    const rows = filtered.map((t) => [
      t.date,
      `"${t.narration.replace(/"/g, '""')}"`,
      t.id,
      t.type,
      t.debit || 0,
      t.credit || 0,
      Math.round(t.balance),
    ].join(","));
    downloadBlob([headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8", `BharatBank_Statement_${Date.now()}.csv`);
    toast.success("CSV downloaded");
  };

  const exportPDF = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Bharat Bank Statement</title>
      <style>
        body{font-family:Helvetica,Arial,sans-serif;margin:32px;color:#0f172a;}
        h1{color:#1e3a8a;margin:0;font-size:20px;}
        .meta{color:#64748b;font-size:12px;margin-bottom:16px;}
        table{width:100%;border-collapse:collapse;font-size:11px;}
        th{background:#1e3a8a;color:#fff;text-align:left;padding:6px 8px;}
        td{border-bottom:1px solid #e2e8f0;padding:6px 8px;}
        .credit{color:#15803d;} .debit{color:#b91c1c;}
        .brand{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
        .badge{font-size:10px;color:#b45309;font-weight:700;letter-spacing:2px;}
      </style></head><body>
      <div class="brand"><h1>Bharat Bank — Account Statement</h1><div class="badge">NET BANKING · INDIA</div></div>
      <div class="meta">A/c: ${profile.accountNumber} · IFSC ${profile.ifsc} · ${profile.fullName}<br/>Generated: ${new Date().toLocaleString("en-IN")}</div>
      <table>
        <thead><tr><th>Date</th><th>Narration</th><th>Reference</th><th>Type</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
        <tbody>
          ${filtered.map((t) => `<tr>
            <td>${t.date}</td><td>${t.narration}</td><td>${t.id}</td><td>${t.type}</td>
            <td class="debit">${t.debit ? "₹" + Math.round(t.debit).toLocaleString("en-IN") : "—"}</td>
            <td class="credit">${t.credit ? "₹" + Math.round(t.credit).toLocaleString("en-IN") : "—"}</td>
            <td>₹${Math.round(t.balance).toLocaleString("en-IN")}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      <script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script>
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) { toast.error("Popup blocked"); return; }
    w.document.write(html); w.document.close();
    toast.success("Statement ready for PDF");
  };

  return (
    <AppLayout>
      <PageHeader
        title="Account Statement"
        subtitle="Full transaction history with filters & exports"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}><FileSpreadsheet className="w-4 h-4 mr-1" />CSV</Button>
            <Button className="bg-gradient-primary" onClick={exportPDF}><Download className="w-4 h-4 mr-1" />PDF</Button>
          </div>
        }
      />
      <Card className="p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by narration or reference id…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Input type="date" className="w-auto" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" className="w-auto" value={to} onChange={(e) => setTo(e.target.value)} />
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
          <span className="text-muted-foreground">Showing {(page - 1) * PAGE + 1}–{Math.min(page * PAGE, filtered.length)} of {filtered.length} · Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft className="w-3.5 h-3.5 mr-1" />Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next<ChevronRight className="w-3.5 h-3.5 ml-1" /></Button>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
}