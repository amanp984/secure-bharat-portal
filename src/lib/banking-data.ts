// Centralized customer & account data. Live balances are computed from the
// transaction ledger in `useTransactions` — see `computeCurrentBalance` below.
// `accounts[].balance` is the OPENING balance only. Never read it as the
// current/available balance.

export const accounts = [
  {
    id: "cur",
    type: "Current Account",
    masked: "XXXX XXXX 5867",
    accountNumber: "68773245867",
    ifsc: "IDIB0BOMHGAH",
    branch: "Mumbai",
    customerId: "873342567",
    status: "Active",
    /** Opening balance only — current balance = opening + Σcredits − Σdebits */
    balance: 0,
    primary: true,
    color: "from-blue-700 via-indigo-700 to-slate-900",
  },
];

export function computeCurrentBalance(
  txns: ReadonlyArray<{ credit?: number; debit?: number }>,
  opening: number = accounts[0]?.balance ?? 0,
): number {
  let bal = opening;
  for (const t of txns) bal += (t.credit || 0) - (t.debit || 0);
  return bal;
}

export const profile = {
  fullName: "Aman Prajapati",
  customerId: "873342567",
  accountNumber: "68773245867",
  ifsc: "IDIB0BOMHGAH",
  micr: "45895398320",
  mobile: "+91 XXXXX88732",
  email: "Ap97662996@gmail.com",
  address: "Rahul, Borivali Town, Mumbai – 66",
  aadhaar: "XXXX XXXX 3671",
  pan: "AXXXX0000X",
  branch: "Mumbai",
  branchAddress: "DATTANI TOWER, Near Indian Petrol Pump-33-AG, Mumbai – 95",
  accountType: "Current Account",
  kycStatus: "Verified",
  accountStatus: "Active",
  nominee: "Sachin (Spouse)",
  openedOn: "14 March 2018",
  lastLogin: "Just now · Mumbai",
  occupation: "Business Owner",
  customerCategory: "Priority Customer",
};

export const tickets = [
  { id: "SR248921", subject: "Debit card PIN reset", status: "Resolved", createdAt: "18 May 2026", resolution: "PIN reset successfully" },
  { id: "SR248755", subject: "Failed UPI transaction refund", status: "In Progress", createdAt: "20 May 2026", resolution: "Awaiting reversal" },
  { id: "SR248610", subject: "Cheque book request", status: "Resolved", createdAt: "12 May 2026", resolution: "Dispatched via Speed Post" },
  { id: "SR248455", subject: "Net Banking login issue", status: "Resolved", createdAt: "08 May 2026", resolution: "Password regenerated" },
];

export const faqs = [
  { q: "How do I reset my Net Banking password?", a: "Visit the login page, click 'Forgot Password' and follow the verification steps using your registered mobile and Debit Card." },
  { q: "What is the daily IMPS transfer limit?", a: "The default daily IMPS limit is ₹5,00,000 per day. You can request a higher limit via Mobile Banking." },
  { q: "How long does NEFT take?", a: "NEFT transactions are processed in half-hourly batches between 00:30 AM and 11:30 PM on all 365 days." },
  { q: "How do I block a lost Debit Card?", a: "Go to Debit Card → Block Card, or call our 24x7 toll-free 1800-572-9900 to block instantly." },
  { q: "Is Indian One a real bank?", a: "No. Indian One is an independent demonstration and evaluation platform. It is not a banking institution and does not provide banking services." },
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
