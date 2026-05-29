export const accounts = [
  {
    id: "cur",
    type: "Current Account",
    masked: "XXXX XXXX 0001",
    accountNumber: "XXXXXXXX0001",
    ifsc: "DEMO0000001",
    branch: "Demo Main Branch",
    customerId: "DEMO0001",
    status: "Active",
    balance: 1248903.1,
    primary: true,
    color: "from-blue-700 via-indigo-700 to-slate-900",
  },
];

const transactionSeeds = [
  ["2026-05-23", "23 May 2026", "UPI/PAY/AMAZON SELLER SERVICES", "Debit", 2489, "UPI"],
  ["2026-05-22", "22 May 2026", "NEFT/HDFC/SALARY CREDIT", "Credit", 185000, "NEFT"],
  ["2026-05-21", "21 May 2026", "IMPS/ICICI/RAHUL KUMAR", "Debit", 12500, "IMPS"],
  ["2026-05-20", "20 May 2026", "ATM WDL CHENNAI ANNA NAGAR", "Debit", 10000, "ATM"],
  ["2026-05-19", "19 May 2026", "POS/SWIGGY BANGALORE", "Debit", 874, "POS"],
  ["2026-05-18", "18 May 2026", "BBPS/AIRTEL BROADBAND", "Debit", 1499, "BBPS"],
  ["2026-05-17", "17 May 2026", "INTEREST CREDIT", "Credit", 923, "SYSTEM"],
  ["2026-05-16", "16 May 2026", "UPI/GPAY/KIRANA STORES", "Debit", 1260, "UPI"],
  ["2026-05-15", "15 May 2026", "RTGS/AXIS/VENDOR PAYMENT", "Debit", 78250, "RTGS"],
  ["2026-05-14", "14 May 2026", "UPI/PHONEPE/METRO CARD", "Debit", 450, "UPI"],
  ["2026-05-13", "13 May 2026", "NEFT/SBI/CLIENT RECEIPT", "Credit", 94500, "NEFT"],
  ["2026-05-12", "12 May 2026", "POS/RELIANCE RETAIL", "Debit", 6230, "POS"],
  ["2026-05-11", "11 May 2026", "IMPS/KOTAK/MEERA IYER", "Credit", 25000, "IMPS"],
  ["2026-05-10", "10 May 2026", "BBPS/TNEB ELECTRICITY", "Debit", 5380, "BBPS"],
  ["2026-05-09", "09 May 2026", "UPI/PAYTM/FUEL STATION", "Debit", 3200, "UPI"],
  ["2026-05-08", "08 May 2026", "GST CHALLAN PAYMENT", "Debit", 45890, "TAX"],
  ["2026-05-07", "07 May 2026", "CASH DEPOSIT ANNA NAGAR", "Credit", 70000, "BRANCH"],
  ["2026-05-06", "06 May 2026", "UPI/ZOMATO LIMITED", "Debit", 1168, "UPI"],
  ["2026-05-05", "05 May 2026", "ACH/SIP MUTUAL FUND", "Debit", 15000, "ACH"],
  ["2026-05-04", "04 May 2026", "IMPS/HDFC/SUPPLIER SETTLEMENT", "Debit", 34500, "IMPS"],
  ["2026-05-03", "03 May 2026", "UPI/BOOKMYSHOW", "Debit", 1320, "UPI"],
  ["2026-05-02", "02 May 2026", "NEFT/CLIENT INVOICE BB-1421", "Credit", 128400, "NEFT"],
  ["2026-05-01", "01 May 2026", "BANK CHARGES GST", "Debit", 236, "SYSTEM"],
  ["2026-04-30", "30 Apr 2026", "POS/APOLLO PHARMACY", "Debit", 2860, "POS"],
  ["2026-04-29", "29 Apr 2026", "UPI/DMART AVENUE", "Debit", 4124, "UPI"],
  ["2026-04-28", "28 Apr 2026", "RTGS/CITI/PROJECT ADVANCE", "Credit", 215000, "RTGS"],
  ["2026-04-27", "27 Apr 2026", "CHEQUE CLEARING 482915", "Debit", 65000, "CHEQUE"],
  ["2026-04-26", "26 Apr 2026", "BBPS/JIO POSTPAID", "Debit", 799, "BBPS"],
  ["2026-04-25", "25 Apr 2026", "UPI/UBER INDIA", "Debit", 684, "UPI"],
  ["2026-04-24", "24 Apr 2026", "NEFT/REFUND GST", "Credit", 18320, "NEFT"],
  ["2026-04-23", "23 Apr 2026", "ATM WDL T NAGAR CHENNAI", "Debit", 8000, "ATM"],
  ["2026-04-22", "22 Apr 2026", "IMPS/AXIS/STAFF REIMBURSEMENT", "Debit", 9200, "IMPS"],
  ["2026-04-21", "21 Apr 2026", "UPI/AMAZON PAY", "Debit", 2599, "UPI"],
  ["2026-04-20", "20 Apr 2026", "CASH DEPOSIT CDM CHENNAI", "Credit", 54000, "CDM"],
  ["2026-04-19", "19 Apr 2026", "POS/HOTEL SARAVANA BHAVAN", "Debit", 2140, "POS"],
  ["2026-04-18", "18 Apr 2026", "BBPS/CHENNAI METRO WATER", "Debit", 1265, "BBPS"],
] as const;

export const transactions = transactionSeeds.map(([isoDate, date, narration, type, amount, channel], i) => ({
  id: `BBTXN${2605000 + i}`,
  isoDate,
  date,
  narration,
  channel,
  type,
  debit: type === "Debit" ? amount : 0,
  credit: type === "Credit" ? amount : 0,
  balance: 1248903.1 - i * 11372.85 + (type === "Credit" ? amount * 0.12 : -amount * 0.04),
}));

export const beneficiaries = [
  { id: "b1", name: "Demo Payee One", bank: "Demo Bank A", acc: "XXXX 0001", last: "18 May 2026" },
  { id: "b2", name: "Sample Enterprises", bank: "Demo Bank B", acc: "XXXX 0002", last: "12 May 2026" },
  { id: "b3", name: "Example Vendor", bank: "Demo Bank C", acc: "XXXX 0003", last: "06 May 2026" },
];

export const profile = {
  fullName: "John Q. Demo",
  customerId: "DEMO0001",
  accountNumber: "XXXXXXXX0001",
  ifsc: "DEMO0000001",
  micr: "000000000",
  mobile: "+91 90000 00000",
  email: "demo.user@example.com",
  address: "123 Demo Street, Sample Locality, Example City – 000000",
  aadhaar: "XXXX XXXX 0000",
  pan: "AXXXX0000X",
  branch: "Demo Main Branch",
  branchAddress: "1, Demo Avenue, Sample Locality, Example City – 000000",
  accountType: "Current Account",
  kycStatus: "Verified",
  accountStatus: "Active",
  nominee: "Jane Demo (Spouse)",
  openedOn: "14 March 2018",
  lastLogin: "21 May 2026, 09:42 AM · Example City",
  occupation: "Business Owner",
  customerCategory: "Priority Banking",
};

export const tickets = [
  { id: "SR248921", subject: "Debit card PIN reset", status: "Resolved", createdAt: "18 May 2026", resolution: "PIN reset successfully" },
  { id: "SR248755", subject: "Failed UPI transaction refund", status: "In Progress", createdAt: "20 May 2026", resolution: "Awaiting bank reversal" },
  { id: "SR248610", subject: "Cheque book request", status: "Resolved", createdAt: "12 May 2026", resolution: "Dispatched via Speed Post" },
  { id: "SR248455", subject: "Net Banking login issue", status: "Resolved", createdAt: "08 May 2026", resolution: "Password regenerated" },
];

export const faqs = [
  { q: "How do I reset my Net Banking password?", a: "Visit the login page, click 'Forgot Password' and follow the OTP-based verification using your registered mobile and Debit Card." },
  { q: "What is the daily IMPS transfer limit?", a: "The default daily IMPS limit is ₹5,00,000 per day. You can request a higher limit via Mobile Banking." },
  { q: "How long does NEFT take?", a: "NEFT transactions are processed in half-hourly batches between 00:30 AM and 11:30 PM on all 365 days." },
  { q: "How do I block a lost Debit Card?", a: "Go to Debit Card → Block Card, or call our 24x7 toll-free 1800-572-9900 to block instantly." },
  { q: "Is my money safe with Indian Bank One?", a: "All deposits are insured under DICGC up to ₹5,00,000 per depositor per bank." },
];

export const billers = [
  { name: "Electricity", icon: "Zap" },
  { name: "Water", icon: "Droplet" },
  { name: "Gas", icon: "Flame" },
  { name: "Broadband", icon: "Wifi" },
  { name: "DTH", icon: "Tv" },
  { name: "Mobile", icon: "Smartphone" },
  { name: "Credit Card", icon: "CreditCard" },
  { name: "FASTag", icon: "Car" },
];