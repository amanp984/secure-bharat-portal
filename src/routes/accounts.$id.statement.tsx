import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { transactions, accounts, profile } from "@/lib/banking-data";
import { downloadStatementPDF } from "@/lib/pdf-statement";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileSpreadsheet, Search, ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

export const Route = createFileRoute("/accounts/$id/statement")({
  component: StatementPage,
  head: ({ params }) => {
    const url = `https://indbanksample.lovable.app/accounts/${params.id}/statement`;
    const title = `Account Statement — Bharat Bank`;
    const desc = `Download and search your full Bharat Bank account statement with date filters, pagination and PDF export.`;
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
  const acc = accounts[0];
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Credit" | "Debit">("All");

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const matchesQ = t.narration.toLowerCase().includes(q.toLowerCase()) || t.id.includes(q);
        const matchesType = typeFilter === "All" || t.type === typeFilter;
        const matchesFrom = !from || t.isoDate >= from;
        const matchesTo = !to || t.isoDate <= to;
        return matchesQ && matchesType && matchesFrom && matchesTo;
      }),
    [q, from, to, typeFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);

  const summary = useMemo(() => {
    const totalCredit = transactions.reduce((s, t) => s + (t.credit || 0), 0);
    const totalDebit = transactions.reduce((s, t) => s + (t.debit || 0), 0);
    const opening = acc.balance - totalCredit + totalDebit;
    return {
      available: acc.balance,
      opening,
      closing: acc.balance,
      totalCredit,
      totalDebit,
    };
  }, [acc.balance]);

  const exportCSV = () => {
    const headers = ["Date", "Narration", "Reference", "Type", "Debit", "Credit", "Balance"];
    const rows = filtered.map((t) =>
      [t.date, `"${t.narration.replace(/"/g, '""')}"`, t.id, t.type, t.debit || 0, t.credit || 0, Math.round(t.balance)].join(","),
    );
    downloadBlob([headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8", `BharatBank_Statement_${Date.now()}.csv`);
    toast.success("CSV downloaded");
  };

  const exportPDF = () => {
    downloadStatementPDF(filtered);
  };


  const pageNumbers = useMemo(() => {
    const max = Math.min(totalPages, 5);
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <AppLayout>
      <PageHeader
        title="Account Statement"
        subtitle={`${acc.type} · A/c ${acc.masked} · ${filtered.length} transactions`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}><FileSpreadsheet className="w-4 h-4 mr-1.5" />Download CSV</Button>
            <Button className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white hover:opacity-95" onClick={exportPDF}>
              <Download className="w-4 h-4 mr-1.5" />Download PDF
            </Button>
          </div>
        }
      />

      <Card className="p-3 mb-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9 h-9" placeholder="Search by narration or reference id…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <div className="flex items-center gap-1 border rounded-md p-0.5 bg-secondary/40">
          {(["All", "Credit", "Debit"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-2.5 h-7 text-[11px] font-semibold rounded transition-colors ${
                typeFilter === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <Input type="date" className="w-auto h-9" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-xs text-muted-foreground">to</span>
        <Input type="date" className="w-auto h-9" value={to} onChange={(e) => setTo(e.target.value)} />
      </Card>




      <Card className="overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 text-[10.5px] uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="text-left px-3 py-2.5 font-semibold">Date</th>
                <th className="text-left px-3 py-2.5 font-semibold">Narration</th>
                <th className="text-left px-3 py-2.5 font-semibold">Reference ID</th>
                <th className="text-right px-3 py-2.5 font-semibold">Debit</th>
                <th className="text-right px-3 py-2.5 font-semibold">Credit</th>
                <th className="text-right px-3 py-2.5 font-semibold">Available Balance</th>
                <th className="text-center px-3 py-2.5 font-semibold">Type</th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={page + q}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="divide-y"
              >
                {paged.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No transactions match your search.</td></tr>
                )}
                {paged.map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{t.date}</td>
                    <td className="px-3 py-2.5 font-medium text-foreground">{t.narration}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{t.id}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-destructive">{t.debit ? fmt(t.debit) : "—"}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-success">{t.credit ? fmt(t.credit) : "—"}</td>
                    <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">{fmt(t.balance)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${t.type === "Credit" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {t.type === "Credit" ? <ArrowDownLeft className="w-2.5 h-2.5" /> : <ArrowUpRight className="w-2.5 h-2.5" />}
                        {t.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between p-3 border-t bg-secondary/30 text-xs">
          <span className="text-muted-foreground">
            Showing <b className="text-foreground">{filtered.length === 0 ? 0 : (page - 1) * PAGE + 1}–{Math.min(page * PAGE, filtered.length)}</b> of <b className="text-foreground">{filtered.length}</b>
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />Previous
            </Button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-8 min-w-8 px-2.5 rounded-md text-xs font-semibold border transition-all ${
                  n === page
                    ? "bg-gradient-to-b from-blue-700 to-indigo-800 text-white border-transparent shadow-sm"
                    : "bg-card hover:bg-secondary border-border text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
            <Button variant="outline" size="sm" className="h-8" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next<ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
}
