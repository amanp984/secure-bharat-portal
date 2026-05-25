import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { accounts, profile, transactions } from "@/lib/banking-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
  head: () => {
    const title = "Full Transaction History — Bharat Bank";
    const desc = "Search, filter and review Bharat Bank debit and credit transactions with secure net banking pagination.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
      links: [{ rel: "canonical", href: "https://indbanksample.lovable.app/transactions" }],
    };
  },
});

const PAGE_SIZE = 10;

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

function TransactionsPage() {
  const acc = accounts[0];
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"All" | "Credit" | "Debit">("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesQuery =
        txn.narration.toLowerCase().includes(query.toLowerCase()) ||
        txn.id.toLowerCase().includes(query.toLowerCase()) ||
        txn.channel.toLowerCase().includes(query.toLowerCase());
      const matchesType = type === "All" || txn.type === type;
      const matchesFrom = !from || txn.isoDate >= from;
      const matchesTo = !to || txn.isoDate <= to;
      return matchesQuery && matchesType && matchesFrom && matchesTo;
    });
  }, [from, query, to, type]);

  const totals = useMemo(
    () => ({
      credit: filtered.reduce((sum, txn) => sum + txn.credit, 0),
      debit: filtered.reduce((sum, txn) => sum + txn.debit, 0),
      count: filtered.length,
    }),
    [filtered],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5);

  const downloadCSV = () => {
    const headers = ["Date", "Narration", "Transaction ID", "Debit", "Credit", "Balance", "Status"];
    const rows = filtered.map((txn) =>
      [txn.date, `"${txn.narration.replace(/"/g, '""')}"`, txn.id, txn.debit, txn.credit, txn.balance.toFixed(2), "Success"].join(","),
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BharatBank_Transactions_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Transaction history downloaded");
  };

  const downloadPDF = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Bharat Bank Transaction Statement</title><style>
      body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#0f172a}.head{display:flex;justify-content:space-between;border-bottom:3px solid #1e3a8a;padding-bottom:10px}.brand{font-size:22px;font-weight:800;color:#1e3a8a}.sub{font-size:10px;color:#b45309;letter-spacing:2px;font-weight:700}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px 22px;margin:14px 0;font-size:11px}.grid span{color:#64748b;display:inline-block;min-width:120px}h2{font-size:12px;text-transform:uppercase;color:#1e3a8a;letter-spacing:1px;border-bottom:1px solid #cbd5e1;padding-bottom:4px}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#1e3a8a;color:white;text-align:left;padding:7px}td{border-bottom:1px solid #e2e8f0;padding:6px}tr:nth-child(even) td{background:#f8fafc}.r{text-align:right}.cr{color:#15803d;font-weight:700}.dr{color:#b91c1c;font-weight:700}.status{color:#15803d;font-weight:700}.foot{margin-top:18px;text-align:center;border-top:2px solid #1e3a8a;padding-top:8px;font-size:10px;color:#64748b}@page{size:A4;margin:14mm}
    </style></head><body><div class="head"><div><div class="brand">Bharat Bank</div><div class="sub">NET BANKING · INDIA</div></div><div style="text-align:right;font-size:11px"><b>Transaction Statement</b><br/>Generated ${new Date().toLocaleString("en-IN")}</div></div>
    <h2>Customer & Account Details</h2><div class="grid"><div><span>Customer Name</span><b>${profile.fullName}</b></div><div><span>Account Number</span><b>${profile.accountNumber}</b></div><div><span>CIF ID</span><b>${profile.customerId}</b></div><div><span>IFSC</span><b>${profile.ifsc}</b></div><div><span>Branch</span><b>${profile.branch}</b></div><div><span>Available Balance</span><b>${fmt(acc.balance)}</b></div></div>
    <h2>Full Transaction History</h2><table><thead><tr><th>Date</th><th>Narration</th><th>Transaction ID</th><th class="r">Debit</th><th class="r">Credit</th><th class="r">Balance</th><th>Status</th></tr></thead><tbody>${filtered.map((txn) => `<tr><td>${txn.date}</td><td>${txn.narration}</td><td>${txn.id}</td><td class="r dr">${txn.debit ? fmt(txn.debit) : "—"}</td><td class="r cr">${txn.credit ? fmt(txn.credit) : "—"}</td><td class="r">${fmt(txn.balance)}</td><td class="status">Success</td></tr>`).join("")}</tbody></table><div class="foot">This is a system generated statement and does not require signature.</div><script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;
    const win = window.open("", "_blank");
    if (!win) return toast.error("Popup blocked — allow popups to download PDF");
    win.document.write(html);
    win.document.close();
    toast.success("PDF statement ready");
  };

  return (
    <AppLayout>
      <PageHeader
        title="Full Transaction History"
        subtitle={`${acc.type} · A/c ${acc.masked} · ${filtered.length} matching records`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={downloadPDF}>
              <FileText className="w-4 h-4 mr-1.5" />Download PDF Statement
            </Button>
            <Button onClick={downloadCSV} className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-95">
              <Download className="w-4 h-4 mr-1.5" />Download CSV Statement
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 mb-3">
        <Card className="p-3 border-l-4 border-l-primary shadow-card-soft">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Available Balance</p>
          <p className="text-lg font-bold mt-1">{fmt(acc.balance)}</p>
        </Card>
        <Card className="p-3 border-l-4 border-l-success shadow-card-soft">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Credits in View</p>
          <p className="text-lg font-bold text-success mt-1">{fmt(totals.credit)}</p>
        </Card>
        <Card className="p-3 border-l-4 border-l-destructive shadow-card-soft">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Debits in View</p>
          <p className="text-lg font-bold text-destructive mt-1">{fmt(totals.debit)}</p>
        </Card>
      </div>

      <Card className="p-3 mb-3 shadow-card-soft">
        <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto_auto] items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 h-9"
              placeholder="Search narration, reference ID or channel"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-1 border rounded-md p-0.5 bg-secondary/60">
            {(["All", "Credit", "Debit"] as const).map((option) => (
              <button
                key={option}
                onClick={() => {
                  setType(option);
                  setPage(1);
                }}
                className={`h-8 px-3 rounded text-[11px] font-bold transition-all ${
                  type === option ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <Input type="date" className="h-9 w-full sm:w-[150px]" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} />
          </div>
          <Input type="date" className="h-9 w-full sm:w-[150px]" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} />
        </div>
      </Card>

      <Card className="overflow-hidden shadow-card-soft">
        <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> Secure transaction ledger
          </div>
          <Badge variant="secondary" className="text-[10px]">{totals.count} records</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="text-left px-3 py-2.5 font-bold">Date</th>
                <th className="text-left px-3 py-2.5 font-bold min-w-[230px]">Narration</th>
                <th className="text-left px-3 py-2.5 font-bold">Transaction ID</th>
                <th className="text-right px-3 py-2.5 font-bold">Debit</th>
                <th className="text-right px-3 py-2.5 font-bold">Credit</th>
                <th className="text-right px-3 py-2.5 font-bold">Balance</th>
                <th className="text-center px-3 py-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={`${page}-${query}-${type}-${from}-${to}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="divide-y"
              >
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">No transactions found for selected filters.</td>
                  </tr>
                ) : (
                  pageItems.map((txn) => (
                    <tr key={txn.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground font-medium">{txn.date}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${txn.type === "Credit" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                            {txn.type === "Credit" ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </span>
                          <div>
                            <p className="font-semibold text-foreground leading-tight">{txn.narration}</p>
                            <p className="text-[10px] text-muted-foreground">{txn.type} transaction</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{txn.id}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-destructive whitespace-nowrap">{txn.debit ? fmt(txn.debit) : "—"}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-success whitespace-nowrap">{txn.credit ? fmt(txn.credit) : "—"}</td>
                      <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">{fmt(txn.balance)}</td>
                      <td className="px-3 py-2.5 text-center"><Badge variant="outline" className="border-success/30 bg-success/10 text-success text-[10px]">Success</Badge></td>
                    </tr>
                  ))
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-secondary/30 px-3 py-2.5 text-xs">
          <span className="text-muted-foreground">
            Showing <b className="text-foreground">{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</b> of <b className="text-foreground">{filtered.length}</b>
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />Previous
            </Button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`h-8 min-w-8 rounded-md border px-2.5 text-xs font-bold transition-all ${
                  number === page ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {number}
              </button>
            ))}
            <Button variant="outline" size="sm" className="h-8" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
              Next<ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
}