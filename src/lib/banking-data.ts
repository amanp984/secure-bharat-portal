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
    balance: 0,
    primary: true,
    color: "from-blue-700 via-indigo-700 to-slate-900",
  },
];

// Transactions are now live from Supabase — see `src/hooks/useTransactions.ts`.
// All static/demo transaction seeds have been removed.


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