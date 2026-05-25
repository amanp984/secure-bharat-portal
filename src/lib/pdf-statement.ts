import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { accounts, profile, transactions } from "./banking-data";

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Txn = (typeof transactions)[number];

export function downloadStatementPDF(txns: Txn[] = transactions) {
  const loadingId = toast.loading("Generating Statement...");
  try {
    const acc = accounts[0];
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 36;

    // Header bar
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageW, 70, "F");

    // Logo box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 18, 36, 36, 6, 6, "F");
    doc.setTextColor(30, 58, 138);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("B", margin + 18, 44, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Bharat Bank", margin + 48, 36);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("NET BANKING STATEMENT", margin + 48, 52);

    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, pageW - margin, 36, { align: "right" });
    doc.text(`IFSC: ${acc.ifsc}  |  Branch: ${profile.branch}`, pageW - margin, 52, { align: "right" });

    // Account details block
    let y = 96;
    doc.setTextColor(30, 58, 138);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("ACCOUNT DETAILS", margin, y);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y + 4, pageW - margin, y + 4);

    const details: [string, string][] = [
      ["Account Holder", profile.fullName],
      ["Customer ID / CIF", profile.customerId],
      ["Account Number", profile.accountNumber],
      ["Account Type", acc.type],
      ["Available Balance", `INR ${fmtINR(acc.balance)}`],
      ["Branch Address", profile.branchAddress],
      ["Registered Mobile", profile.mobile],
      ["Email", profile.email],
    ];

    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const colW = (pageW - margin * 2) / 2;
    details.forEach((row, i) => {
      const col = i % 2;
      const rowY = y + Math.floor(i / 2) * 18;
      doc.setTextColor(100, 116, 139);
      doc.text(row[0], margin + col * colW, rowY);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text(String(row[1]), margin + col * colW + 110, rowY, { maxWidth: colW - 110 });
      doc.setFont("helvetica", "normal");
    });

    const tableStartY = y + Math.ceil(details.length / 2) * 18 + 12;

    autoTable(doc, {
      startY: tableStartY,
      head: [["Date", "Narration", "Transaction ID", "Debit (INR)", "Credit (INR)", "Balance (INR)"]],
      body: transactions.map((t) => [
        t.date,
        t.narration,
        t.id,
        t.debit ? fmtINR(t.debit) : "-",
        t.credit ? fmtINR(t.credit) : "-",
        fmtINR(t.balance),
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 4, textColor: [15, 23, 42] },
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 8.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 60 },
        2: { cellWidth: 72, font: "courier" },
        3: { halign: "right", textColor: [185, 28, 28] },
        4: { halign: "right", textColor: [21, 128, 61] },
        5: { halign: "right", fontStyle: "bold" },
      },
      margin: { left: margin, right: margin },
      didDrawPage: () => {
        // Footer on every page
        const fy = pageH - 30;
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(1.5);
        doc.line(margin, fy - 10, pageW - margin, fy - 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("Computer generated statement - does not require signature.", pageW / 2, fy, { align: "center" });
        doc.text("Bharat Bank Ltd. - Secure Net Banking - Customer Care 1800-123-4567", pageW / 2, fy + 11, { align: "center" });
      },
    });

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const filename = `BharatBank_Statement_${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}.pdf`;
    doc.save(filename);

    toast.dismiss(loadingId);
    toast.success("Statement downloaded successfully");
  } catch (err) {
    console.error(err);
    toast.dismiss(loadingId);
    toast.error("Failed to generate statement");
  }
}
