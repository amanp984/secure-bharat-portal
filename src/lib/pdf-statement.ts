import { toast } from "sonner";
import { accounts, profile, transactions } from "./banking-data";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

export function downloadStatementPDF() {
  const acc = accounts[0];
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Bharat Bank Statement</title><style>
    body{font-family:Helvetica,Arial,sans-serif;margin:24px 28px;color:#0f172a}
    .header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1e3a8a;padding-bottom:10px;margin-bottom:14px}
    .logo{display:flex;align-items:center;gap:10px}
    .mark{width:38px;height:38px;border-radius:8px;background:linear-gradient(135deg,#1d4ed8,#312e81);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px}
    h1{color:#1e3a8a;margin:0;font-size:18px}
    .sub{font-size:10px;letter-spacing:3px;color:#b45309;font-weight:700}
    .gen{font-size:10px;color:#64748b;text-align:right}
    h2{font-size:12px;color:#1e3a8a;text-transform:uppercase;letter-spacing:1.5px;margin:14px 0 6px;border-bottom:1px solid #cbd5e1;padding-bottom:3px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 18px;font-size:11px}
    .grid div span{color:#64748b;display:inline-block;min-width:120px}
    table{width:100%;border-collapse:collapse;font-size:10px;margin-top:6px}
    th{background:#1e3a8a;color:#fff;text-align:left;padding:6px 8px}
    td{border-bottom:1px solid #e2e8f0;padding:6px 8px}
    tr:nth-child(even) td{background:#f8fafc}
    .credit{color:#15803d;font-weight:600}.debit{color:#b91c1c;font-weight:600}
    .footer{margin-top:18px;border-top:2px solid #1e3a8a;padding-top:8px;text-align:center;font-size:10px;color:#64748b}
    @page{size:A4;margin:14mm}
  </style></head><body>
    <div class="header">
      <div class="logo"><div class="mark">B</div><div><h1>Bharat Bank</h1><div class="sub">NET BANKING · INDIA</div></div></div>
      <div class="gen"><b>Account Statement</b><br/>Generated: ${new Date().toLocaleString("en-IN")}</div>
    </div>
    <h2>Customer & Account Details</h2>
    <div class="grid">
      <div><span>Customer Name</span><b>${profile.fullName}</b></div>
      <div><span>Account Number</span><b>${profile.accountNumber}</b></div>
      <div><span>CIF ID</span><b>${profile.customerId}</b></div>
      <div><span>IFSC</span><b>${profile.ifsc}</b></div>
      <div><span>Branch</span><b>${profile.branch}</b></div>
      <div><span>Available Balance</span><b>${fmt(acc.balance)}</b></div>
    </div>
    <h2>Transaction Records (${transactions.length})</h2>
    <table><thead><tr>
      <th>Date</th><th>Narration</th><th>Reference</th>
      <th style="text-align:right">Debit</th><th style="text-align:right">Credit</th><th style="text-align:right">Balance</th>
    </tr></thead><tbody>
      ${transactions.map((t) => `<tr>
        <td>${t.date}</td><td>${t.narration}</td><td style="font-family:monospace">${t.id}</td>
        <td style="text-align:right" class="debit">${t.debit ? fmt(t.debit) : "—"}</td>
        <td style="text-align:right" class="credit">${t.credit ? fmt(t.credit) : "—"}</td>
        <td style="text-align:right">${fmt(t.balance)}</td>
      </tr>`).join("")}
    </tbody></table>
    <div class="footer">This is a system generated statement and does not require a signature.<br/><b>Bharat Bank Ltd.</b> · Customer Care 1800-123-4567</div>
    <script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (!w) { toast.error("Popup blocked — allow popups to download the PDF"); return; }
  w.document.write(html); w.document.close();
  toast.success("Statement ready — print or save as PDF");
}
