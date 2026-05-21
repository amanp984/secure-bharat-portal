export const accounts = [
  {
    id: "cur",
    type: "Current Account",
    masked: "5021 7894 7812",
    accountNumber: "502178947812",
    ifsc: "BHAR0000123",
    branch: "Anna Nagar, Chennai",
    customerId: "5489221",
    status: "Active",
    balance: 1248903.1,
    primary: true,
    color: "from-blue-700 via-indigo-700 to-slate-900",
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
  { id: "b1", name: "Jignesh Sahar", bank: "HDFC Bank", acc: "XXXX 6831", last: "18 May 2026" },
  { id: "b2", name: "Jay Mata Di Enterprises", bank: "Axis Bank", acc: "XXXX 4427", last: "12 May 2026" },
  { id: "b3", name: "Amrinder Telecom", bank: "ICICI Bank", acc: "XXXX 9015", last: "06 May 2026" },
];

export const profile = {
  fullName: "Arjun Ramesh Iyer",
  customerId: "5489221",
  accountNumber: "502178947812",
  ifsc: "BHAR0000123",
  mobile: "+91 98xxxxxx21",
  email: "arjun.r@example.com",
  aadhaar: "XXXX XXXX 4892",
  pan: "AXXXX1234R",
  branch: "Anna Nagar Branch",
  branchAddress: "12, 2nd Avenue, Anna Nagar West, Chennai – 600040",
  accountType: "Current Account",
  kycStatus: "Verified",
  accountStatus: "Active",
  nominee: "Lakshmi Iyer (Mother)",
  openedOn: "14 March 2018",
  lastLogin: "21 May 2026, 09:42 AM · Chennai",
};

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