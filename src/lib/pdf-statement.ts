import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { accounts, profile } from "./banking-data";
import { brand } from "./brand";
import type { UiTransaction } from "@/hooks/useTransactions";

export type StatementTxn = UiTransaction;

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n);

const pad2 = (n: number) => String(n).padStart(2, "0");

function ddmmyyyy(iso: string): string {
  // Accept "YYYY-MM-DD" or any Date-parseable string.
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

// ------- Download state singleton (unchanged public API) -------
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
export async function downloadStatementPDF(txns: StatementTxn[] = []) {
  if (activeDownloadPromise) return activeDownloadPromise;

  activeDownloadPromise = (async () => {
    let loadingTimer: number | undefined;
    toast.dismiss(STATEMENT_SUCCESS_TOAST_ID);
    toast.dismiss(STATEMENT_LOADING_TOAST_ID);
    toast.loading("Generating Statement...", { id: STATEMENT_LOADING_TOAST_ID });
    loadingTimer = window.setTimeout(() => toast.dismiss(STATEMENT_LOADING_TOAST_ID), MAX_LOADING_TOAST_MS);
    setDownloading(true);
    await nextPaint();

    try {
      buildPdf(txns);
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
function buildPdf(txnsInput: StatementTxn[]) {
  const acc = accounts[0];
  // Statement renders chronologically (oldest → newest). Source array is desc.
  const txns = [...txnsInput].sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  const totalCredit = txns.reduce((s, t) => s + (t.credit || 0), 0);
  const totalDebit = txns.reduce((s, t) => s + (t.debit || 0), 0);
  const creditCount = txns.filter((t) => t.type === "Credit").length;
  const debitCount = txns.filter((t) => t.type === "Debit").length;

  const closingBalance = acc.balance;
  const openingBalance = closingBalance - totalCredit + totalDebit;
  // Running balance forward from opening
  let running = openingBalance;
  const rows = txns.map((t) => {
    running = running + (t.credit || 0) - (t.debit || 0);
    return {
      date: ddmmyyyy(t.isoDate),
      narration: t.narration,
      ref: t.reference || t.id.slice(0, 12),
      debit: t.debit ? fmtINR(t.debit) : "—",
      credit: t.credit ? fmtINR(t.credit) : "—",
      balance: fmtINR(running),
    };
  });

  const periodFrom = txns.length ? ddmmyyyy(txns[0].isoDate) : "—";
  const periodTo = txns.length ? ddmmyyyy(txns[txns.length - 1].isoDate) : "—";
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

  // ---- HEADER (page 1) ----
  doc.setFillColor(15, 31, 78); // deep navy
  doc.rect(0, 0, pageW, 86, "F");
  // accent bar
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 86, pageW, 3, "F");

  // logo block
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 22, 42, 42, 8, 8, "F");
  doc.setTextColor(15, 31, 78);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("B", margin + 21, 51, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(brand.name, margin + 54, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text("STATEMENT OF ACCOUNT", margin + 54, 56);
  doc.setFontSize(8);
  doc.text(brand.tagline, margin + 54, 68);

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

  // ---- Customer + Account info (two columns) ----
  let y = 110;
  const colGap = 12;
  const colW = (pageW - margin * 2 - colGap) / 2;

  drawInfoCard(doc, margin, y, colW, "Customer Information", [
    ["Name", profile.fullName],
    ["Customer ID", profile.customerId],
    ["Mobile", profile.mobile],
    ["Email", profile.email],
    ["Address", profile.address],
  ]);
  drawInfoCard(doc, margin + colW + colGap, y, colW, "Account Information", [
    ["Account No.", profile.accountNumber],
    ["Account Type", acc.type],
    ["IFSC", acc.ifsc],
    ["Branch", profile.branch],
    ["Branch Address", profile.branchAddress],
    ["Opening Date", profile.openedOn],
    ["Status", profile.accountStatus],
    ["Nominee", profile.nominee],
  ]);

  // height of taller card
  const leftH = cardHeight(5);
  const rightH = cardHeight(8);
  y += Math.max(leftH, rightH) + 14;

  // ---- Statement period strip ----
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageW - margin * 2, 28, 4, 4, "F");
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("STATEMENT PERIOD", margin + 12, y + 12);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(`${periodFrom}  to  ${periodTo}`, margin + 12, y + 23);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`${txns.length} transactions`, pageW - margin - 12, y + 19, { align: "right" });
  y += 40;

  // ---- Summary cards (4 across) ----
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

  // ---- Transactions table (auto-paginates across pages) ----
  autoTable(doc, {
    startY: y,
    head: [["Date", "Narration", "Reference", "Debit (INR)", "Credit (INR)", "Balance (INR)"]],
    body: rows.length
      ? rows.map((r) => [r.date, r.narration, r.ref, r.debit, r.credit, r.balance])
      : [["—", "No transactions in selected period", "—", "—", "—", fmtINR(closingBalance)]],
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
      // Continuation header on pages 2+
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

  // ---- Statement summary box (after table) ----
  let afterY = (doc as any).lastAutoTable?.finalY ?? y;
  if (afterY + 130 > pageH - 60) {
    doc.addPage();
    afterY = 60;
  } else {
    afterY += 18;
  }

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
  if (discY + 70 > pageH - 60) {
    doc.addPage();
    discY = 60;
  }

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
    "• Do not share your OTP, ATM PIN, CVV, Card number, Username or Password with anyone.",
    `• For queries, contact ${brand.name} Customer Care at ${brand.customerCare} or write to ${brand.supportEmail}.`,
  ];
  disclaimers.forEach((line, i) => doc.text(line, margin + 12, discY + 32 + i * 12, { maxWidth: pageW - margin * 2 - 24 }));

  // ---- Footers (Page X of Y) drawn after total count is known ----
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const fy = pageH - 30;
    doc.setDrawColor(15, 31, 78);
    doc.setLineWidth(0.8);
    doc.line(margin, fy - 10, pageW - margin, fy - 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${brand.name} • Net Banking Statement • Customer Care ${brand.customerCare}`, margin, fy);
    doc.text(`Generated ${generatedAt}`, margin, fy + 11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 31, 78);
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, fy + 5, { align: "right" });
  }

  // ---- Save ----
  const now = new Date();
  const filename = `${brand.name.replace(/\s+/g, "")}_Statement_${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}.pdf`;
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

// ------- Helpers -------
function cardHeight(rows: number) {
  return 26 + rows * 14 + 8;
}

function drawInfoCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  title: string,
  rows: [string, string][],
) {
  const h = cardHeight(rows.length);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");

  // title bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(x, y, w, 22, 4, 4, "F");
  // mask the bottom rounded corners
  doc.rect(x, y + 14, w, 8, "F");
  doc.setTextColor(15, 31, 78);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(title.toUpperCase(), x + 10, y + 14);

  // rows
  doc.setFontSize(8.5);
  rows.forEach((r, i) => {
    const ry = y + 30 + i * 14;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(r[0], x + 10, ry);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(String(r[1] ?? "—"), x + 88, ry, { maxWidth: w - 96 });
  });
}
