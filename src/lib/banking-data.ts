export const accounts = [
  {
    id: "sav",
    type: "Savings Account",
    masked: "XXXX XXXX 4521",
    balance: 284562.45,
    primary: true,
    color: "from-blue-600 to-indigo-700",
  },
  {
    id: "cur",
    type: "Current Account",
    masked: "XXXX XXXX 7812",
    balance: 1248903.1,
    primary: false,
    color: "from-slate-700 to-slate-900",
  },
  {
    id: "fd",
    type: "Fixed Deposit",
    masked: "FD XXXX 9923",
    balance: 500000,
    primary: false,
    color: "from-amber-500 to-yellow-700",
  },
  {
    id: "od",
    type: "OD / CC Account",
    masked: "XXXX XXXX 3344",
    balance: 75000,
    primary: false,
    color: "from-emerald-600 to-teal-800",
  },
];

export const transactions = Array.from({ length: 28 }).map((_, i) => {
  const isCredit = i % 3 === 0;
  const amt = Math.round((Math.random() * 9000 + 250) * 100) / 100;
  return {
    id: `TXN${1000000 + i}`,
    date: new Date(Date.now() - i * 86400000 * 1.5).toLocaleDateString("en-IN"),
    narration: [
      "UPI/PAY/AMAZON",
      "NEFT/HDFC/SALARY",
      "IMPS/ICICI/Rahul Kumar",
      "ATM Withdrawal - HYD",
      "POS/SWIGGY BANGALORE",
      "Bill Payment - Airtel",
      "Interest Credit",
      "UPI/GPAY/Shop",
    ][i % 8],
    type: isCredit ? "Credit" : "Debit",
    debit: isCredit ? 0 : amt,
    credit: isCredit ? amt : 0,
    balance: 284562 - i * 1234.5,
  };
});

export const beneficiaries = [
  { id: "b1", name: "Rahul Sharma", bank: "HDFC Bank", acc: "XXXX 4421", last: "12 Nov 2025" },
  { id: "b2", name: "Priya Mehta", bank: "ICICI Bank", acc: "XXXX 7732", last: "08 Nov 2025" },
  { id: "b3", name: "Anil Verma", bank: "SBI", acc: "XXXX 1290", last: "30 Oct 2025" },
  { id: "b4", name: "Sneha Iyer", bank: "Axis Bank", acc: "XXXX 8821", last: "21 Oct 2025" },
  { id: "b5", name: "Karan Patel", bank: "Kotak Mahindra", acc: "XXXX 5567", last: "15 Oct 2025" },
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