import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { accounts, profile } from "./banking-data";
import { brand } from "./brand";
import { getCanonicalTxns } from "./canonical-txns";
import logoUrl from "@/assets/indian-one-logo.png";
import type { UiTransaction } from "@/hooks/useTransactions";
import { fetchTransactionsInRange } from "@/hooks/useTransactions";

export type StatementTxn = UiTransaction;

export interface StatementDownloadOptions {
  /** Pre-filtered transactions. If omitted, we fetch from the database
   *  filtered by from/to (defaulting to the current calendar month). */
  txns?: StatementTxn[];
  /** Inclusive lower bound (YYYY-MM-DD). */
  from?: string;
  /** Inclusive upper bound (YYYY-MM-DD). */
  to?: string;
}

// Cache the logo as a base64 PNG data URL after first load.
let logoDataUrl: string | null = null;
async function loadLogoDataUrl(): Promise<string | null> {
  if (logoDataUrl) return logoDataUrl;
  try {
    const res = await fetch(logoUrl);
    const blob = await res.blob();
    logoDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    return logoDataUrl;
  } catch {
    return null;
  }
}

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n);

const pad2 = (n: number) => String(n).padStart(2, "0");

function ddmmyyyy(iso: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) {
    const [y, m, d] = iso.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
  }
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatGenStamp(d: Date): string {
  const date = `${pad2(d.getDate())} ${d.toLocaleString("en-IN", { month: "short" })} ${d.getFullYear()}`;
  let h = d.getHours();
  const m = pad2(d.getMinutes());
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${date} ${pad2(h)}:${m} ${ampm}`;
}

/** Returns first-of-month and today as YYYY-MM-DD (local). */
export function currentMonthRange(): { from: string; to: string } {
  const now = new Date();
  const from = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-01`;
  const to = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  return { from, to };
}

// ------- Download state singleton -------
let isStatementDownloading = false;
let activeDownloadPromise: Promise<boolean> | null = null;
const statementDownloadListeners = new Set<() => void>();
const STATEMENT_LOADING_TOAST_ID = "statement-download-loading";
const STATEMENT_SUCCESS_TOAST_ID = "statement-download-success";
const MAX_LOADING_TOAST_MS = 750;

function emit() { statementDownloadListeners.forEach((l) => l()); }
function setDownloading(next: boolean) { isStatementDownloading = next; emit(); }

export function useStatementDownloadState() {
  return useSyncExternalStore(
    (listener) => { statementDownloadListeners.add(listener); return () => statementDownloadListeners.delete(listener); },
    () => isStatementDownloading,
    () => false,
  );
}

async function nextPaint() {
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
}

// ------- Public API -------
/**
 * Accepts either the legacy positional txn array OR a StatementDownloadOptions
 * object. When called with no arguments (or an options object without txns
 * and without an explicit date range) it defaults to the current calendar
 * month and fetches directly from the database.
 */
export async function downloadStatementPDF(
  input?: StatementTxn[] | StatementDownloadOptions,
) {
  if (activeDownloadPromise) return activeDownloadPromise;

  const opts: StatementDownloadOptions = Array.isArray(input)
    ? { txns: input }
    : (input ?? {});

  activeDownloadPromise = (async () => {
    let loadingTimer: number | undefined;
    toast.dismiss(STATEMENT_SUCCESS_TOAST_ID);
    toast.dismiss(STATEMENT_LOADING_TOAST_ID);
    toast.loading("Generating Statement...", { id: STATEMENT_LOADING_TOAST_ID });
    loadingTimer = window.setTimeout(() => toast.dismiss(STATEMENT_LOADING_TOAST_ID), MAX_LOADING_TOAST_MS);
    setDownloading(true);
    await nextPaint();

    try {
      // Resolve the effective date range.
      let { from, to } = opts;
      if (!opts.txns && !from && !to) {
        const r = currentMonthRange();
        from = r.from; to = r.to;
      }

      // Resolve the transaction set.
      let txns: StatementTxn[];
      if (opts.txns && opts.txns.length >= 0 && !from && !to) {
        // Explicit txns without a range → treat as filtered slice; use canonical
        // as the source of the running balances but keep the caller's order.
        txns = opts.txns;
      } else if (opts.txns && (from || to)) {
        // Caller provided both a range and a pre-filtered list → trust the list.
        txns = opts.txns;
      } else if (from && to) {
        // DB-level filter — always fetch fresh so the PDF matches the DB state.
        try {
          txns = await fetchTransactionsInRange(from, to);
        } catch {
          // Fallback to canonical snapshot filtered client-side.
          txns = getCanonicalTxns().filter((t) => (!from || t.isoDate >= from) && (!to || t.isoDate <= to));
        }
      } else {
        txns = getCanonicalTxns();
      }

      if (!txns || txns.length === 0) {
        toast.dismiss(STATEMENT_LOADING_TOAST_ID);
        setDownloading(false);
        toast.info("No transactions found for the selected date range.");
        return false;
      }

      const logo = await loadLogoDataUrl();
      buildPdf(txns, logo, { from, to });
      toast.dismiss(STATEMENT_LOADING_TOAST_ID);
      setDownloading(false);
      toast.success("Statement downloaded successfully", { id: STATEMENT_SUCCESS_TOAST_ID, duration: 1200 });
      return true;
    } catch (err) {
      console.error(err);
      toast.dismiss(STATEMENT_LOADING_TOAST_ID);
      setDownloading(false);
      toast.error("Failed to generate statement");
      return false;
    } finally {
      if (loadingTimer) window.clearTimeout(loadingTimer);
      toast.dismiss(STATEMENT_LOADING_TOAST_ID);
      activeDownloadPromise = null;
    }
  })();

  return activeDownloadPromise;
}

// ------- PDF rendering -------
function buildPdf(
  txns: StatementTxn[],
  logoImg: string | null,
  period: { from?: string; to?: string },
) {
  const acc = accounts[0];

  // Sort chronologically so opening/closing math is well-defined.
  const chrono = [...txns].sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  const totalCredit = chrono.reduce((s, t) => s + (t.credit || 0), 0);
  const totalDebit = chrono.reduce((s, t) => s + (t.debit || 0), 0);
  const creditCount = chrono.filter((t) => t.type === "Credit").length;
  const debitCount = chrono.filter((t) => t.type === "Debit").length;

  // Opening = balance BEFORE the earliest filtered txn. Each txn's `balance`
  // is post-transaction, so subtract its credit / add its debit to reverse it.
  const first = chrono[0];
  const openingBalance = first ? first.balance - (first.credit || 0) + (first.debit || 0) : acc.balance;
  const closingBalance = chrono.length ? chrono[chrono.length - 1].balance : openingBalance;

  // Render newest-first in the table (matches on-screen ledger).
  const displayRows = [...chrono].reverse();
  const rows = displayRows.map((t) => ({
    date: ddmmyyyy(t.isoDate),
    narration: t.narration,
    ref: t.reference || t.id.slice(0, 12),
    debit: t.debit ? fmtINR(t.debit) : "—",
    credit: t.credit ? fmtINR(t.credit) : "—",
    balance: fmtINR(t.balance),
  }));

  const periodFrom = period.from ? ddmmyyyy(period.from) : ddmmyyyy(chrono[0].isoDate);
  const periodTo = period.to ? ddmmyyyy(period.to) : ddmmyyyy(chrono[chrono.length - 1].isoDate);
  const generatedAt = formatGenStamp(new Date());

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 36;

  doc.setProperties({
    title: `${brand.name} Statement`,
    subject: "Account statement",
    author: brand.name,
    creator: `${brand.name} Net Banking`,
  });

  // ---- HEADER ----
  doc.setFillColor(15, 31, 78);
  doc.rect(0, 0, pageW, 86, "F");
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 86, pageW, 3, "F");

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 22, 50, 50, 8, 8, "F");
  if (logoImg) {
    try { doc.addImage(logoImg, "PNG", margin + 5, 27, 40, 40); } catch { /* ignore */ }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(brand.name, margin + 62, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text("STATEMENT OF ACCOUNT", margin + 62, 56);
  doc.setFontSize(8);
  doc.text(brand.tagline, margin + 62, 68);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Statement Generated", pageW - margin, 38, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(generatedAt, pageW - margin, 52, { align: "right" });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Period: ${periodFrom} — ${periodTo}`, pageW - margin, 66, { align: "right" });

  // ---- Customer + Account info ----
  let y = 110;
  const colGap = 12;
  const colW = (pageW - margin * 2 - colGap) / 2;

  const leftH = drawInfoCard(doc, margin, y, colW, "Customer Information", [
    ["Name", profile.fullName],
    ["Customer ID", profile.customerId],
    ["Mobile", profile.mobile],
    ["Email", profile.email],
    ["Address", profile.address],
  ]);
  const rightH = drawInfoCard(doc, margin + colW + colGap, y, colW, "Account Information", [
    ["Account No.", profile.accountNumber],
    ["Account Type", acc.type],
    ["IFSC", acc.ifsc],
    ["Branch", profile.branch],
    ["Branch Address", profile.branchAddress],
    ["Status", profile.accountStatus],
  ]);
  y += Math.max(leftH, rightH) + 18;

  // ---- Statement Period banner (clearly at the top of the ledger) ----
  doc.setFillColor(15, 31, 78);
  doc.roundedRect(margin, y, pageW - margin * 2, 26, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Statement Period: ${periodFrom} to ${periodTo}`, margin + 12, y + 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`${chrono.length} transaction${chrono.length === 1 ? "" : "s"}`, pageW - margin - 12, y + 17, { align: "right" });
  y += 36;

  // ---- Summary cards ----
  const cards: { label: string; value: string; color: [number, number, number] }[] = [
    { label: "Opening Balance", value: `INR ${fmtINR(openingBalance)}`, color: [59, 130, 246] },
    { label: "Total Credits", value: `INR ${fmtINR(totalCredit)}`, color: [22, 163, 74] },
    { label: "Total Debits", value: `INR ${fmtINR(totalDebit)}`, color: [220, 38, 38] },
    { label: "Closing Balance", value: `INR ${fmtINR(closingBalance)}`, color: [15, 31, 78] },
  ];
  const cardW = (pageW - margin * 2 - 3 * 8) / 4;
  cards.forEach((c, i) => {
    const x = margin + i * (cardW + 8);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardW, 48, 4, 4, "FD");
    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.rect(x, y, 3, 48, "F");
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(c.label.toUpperCase(), x + 10, y + 16);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(c.value, x + 10, y + 34);
  });
  y += 60;

  // ---- Transactions table ----
  autoTable(doc, {
    startY: y,
    head: [["Date", "Narration", "Reference", "Debit (INR)", "Credit (INR)", "Balance (INR)"]],
    body: rows.map((r) => [r.date, r.narration, r.ref, r.debit, r.credit, r.balance]),
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 5, textColor: [15, 23, 42], lineColor: [226, 232, 240] },
    headStyles: { fillColor: [15, 31, 78], textColor: 255, fontStyle: "bold", fontSize: 8.5, halign: "left" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 58, fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 78, font: "courier", fontSize: 7.5, textColor: [71, 85, 105] },
      3: { cellWidth: 70, halign: "right", textColor: [185, 28, 28] },
      4: { cellWidth: 70, halign: "right", textColor: [21, 128, 61] },
      5: { cellWidth: 78, halign: "right", fontStyle: "bold" },
    },
    margin: { left: margin, right: margin, top: 60, bottom: 60 },
    didDrawPage: () => {
      const pn = doc.getCurrentPageInfo().pageNumber;
      if (pn > 1) {
        doc.setFillColor(15, 31, 78);
        doc.rect(0, 0, pageW, 36, "F");
        doc.setFillColor(245, 158, 11);
        doc.rect(0, 36, pageW, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(brand.name, margin, 22);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(203, 213, 225);
        doc.text("Statement of Account (continued)", margin + 90, 22);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(`A/c ${profile.accountNumber}  •  ${periodFrom} — ${periodTo}`, pageW - margin, 22, { align: "right" });
      }
    },
  });

  // ---- Summary box ----
  let afterY = (doc as any).lastAutoTable?.finalY ?? y;
  if (afterY + 130 > pageH - 60) { doc.addPage(); afterY = 60; } else { afterY += 18; }

  doc.setFillColor(15, 31, 78);
  doc.roundedRect(margin, afterY, pageW - margin * 2, 22, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Statement Summary: ${periodFrom} to ${periodTo}`, margin + 10, afterY + 15);

  autoTable(doc, {
    startY: afterY + 24,
    head: [["Opening Balance", "Credit Count", "Debit Count", "Total Credits", "Total Debits", "Closing Balance"]],
    body: [[
      `INR ${fmtINR(openingBalance)}`,
      String(creditCount),
      String(debitCount),
      `INR ${fmtINR(totalCredit)}`,
      `INR ${fmtINR(totalDebit)}`,
      `INR ${fmtINR(closingBalance)}`,
    ]],
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 6, halign: "center", textColor: [15, 23, 42] },
    headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: "bold", fontSize: 7.5 },
    margin: { left: margin, right: margin },
  });

  const sumY = (doc as any).lastAutoTable?.finalY ?? afterY + 60;
  let discY = sumY + 16;
  if (discY + 70 > pageH - 60) { doc.addPage(); discY = 60; }

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(margin, discY, pageW - margin * 2, 64, 4, 4, "FD");
  doc.setTextColor(146, 64, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Important Notes", margin + 12, discY + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const disclaimers = [
    "• This is a computer generated statement and does not require a signature.",
    "• Do not share your ATM PIN, CVV, Card number, Username or Password with anyone.",
    `• For queries, contact ${brand.name} Customer Care at ${brand.customerCare} or write to ${brand.supportEmail}.`,
  ];
  disclaimers.forEach((line, i) => doc.text(line, margin + 12, discY + 32 + i * 12, { maxWidth: pageW - margin * 2 - 24 }));

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const fy = pageH - 30;
    doc.setDrawColor(15, 31, 78);
    doc.setLineWidth(0.8);
    doc.line(margin, fy - 14, pageW - margin, fy - 14);

    if (logoImg) {
      try { doc.addImage(logoImg, "PNG", margin, fy - 8, 14, 14); } catch { /* ignore */ }
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 31, 78);
    doc.text(`Powered by ${brand.name}`, margin + 18, fy);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Customer Care ${brand.customerCare}  •  Generated ${generatedAt}`, margin + 18, fy + 9);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 31, 78);
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, fy + 4, { align: "right" });
  }

  const now = new Date();
  const rangeTag = period.from && period.to ? `_${period.from}_to_${period.to}` : "";
  const filename = `${brand.name.replace(/\s+/g, "")}_Statement${rangeTag}_${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}.pdf`;
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function drawInfoCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  title: string,
  rows: [string, string][],
): number {
  const labelW = 78;
  const valueX = x + 10 + labelW;
  const valueMaxW = w - 10 - labelW - 10;
  const lineHeight = 11;
  const rowPad = 5;

  doc.setFontSize(8.5);
  const rowHeights = rows.map(([, v]) => {
    const lines = doc.splitTextToSize(String(v ?? "—"), valueMaxW) as string[];
    return Math.max(lineHeight, lines.length * lineHeight) + rowPad;
  });
  const titleH = 22;
  const totalH = titleH + 8 + rowHeights.reduce((s, h) => s + h, 0) + 6;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(x, y, w, totalH, 4, 4, "FD");

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(x, y, w, titleH, 4, 4, "F");
  doc.rect(x, y + 14, w, 8, "F");
  doc.setTextColor(15, 31, 78);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(title.toUpperCase(), x + 10, y + 14);

  doc.setFontSize(8.5);
  let cursor = y + titleH + 10;
  rows.forEach((r, i) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(r[0], x + 10, cursor);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    const lines = doc.splitTextToSize(String(r[1] ?? "—"), valueMaxW) as string[];
    lines.forEach((ln, j) => doc.text(ln, valueX, cursor + j * lineHeight));
    cursor += rowHeights[i];
  });

  return totalH;
}
