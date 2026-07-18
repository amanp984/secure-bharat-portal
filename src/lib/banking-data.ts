// Centralized customer & account data — LIVE store.
//
// All customer info is held in a single in-memory object and persisted to
// localStorage. The exported `profile` and `accounts` references are MUTABLE
// proxies: mutating them via `setBankingData()` updates every reader.
// Components subscribe via `useBankingStore()` to re-render on changes.

import { useSyncExternalStore } from "react";

export type Profile = {
  fullName: string;
  customerId: string;
  accountNumber: string;
  username: string;
  password: string;
  ifsc: string;
  micr: string;
  mobile: string;
  email: string;
  address: string;
  branch: string;
  branchAddress: string;
  // Extras
  upiUsername: string;
  upiId: string;
  registeredPhone: string;
  cardholderName: string;
  bankName: string;
  // Static-ish fields kept for UI continuity
  aadhaar: string;
  pan: string;
  accountType: string;
  kycStatus: string;
  accountStatus: string;
  nominee: string;
  openedOn: string;
  lastLogin: string;
  occupation: string;
  customerCategory: string;
};

const DEFAULT_PROFILE: Profile = {
  fullName: "Ravi Tyres",
  customerId: "24378814379",
  accountNumber: "64318466142",
  username: "24378814379",
  password: "Ravi81916",
  ifsc: "IDIB000G619",
  micr: "3627482394",
  mobile: "+91 7642864311",
  email: "ravity3883@gmail.com",
  address: "Shop no 12, Main Market, Near JK Petrol, Mumbai-85",
  branch: "Mumbai",
  branchAddress: "Indian Bank A/12, Western Highway, Mumbai-83",
  upiUsername: "ravityres",
  upiId: "ravityres@indianbank",
  registeredPhone: "+91 7642864311",
  cardholderName: "Ravi Tyres",
  bankName: "Indian Bank",
  aadhaar: "XXXX XXXX 3671",
  pan: "AXXXX0000X",
  accountType: "Current Account",
  kycStatus: "Verified",
  accountStatus: "Active",
  nominee: "—",
  openedOn: "14 March 2018",
  lastLogin: "Just now · Mumbai",
  occupation: "Business Owner",
  customerCategory: "Priority Customer",
};

const STORAGE_KEY = "indian_one_banking_data_v2";

function loadInitial(): Profile {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_PROFILE };
}

// LIVE singleton — mutated in place so legacy `profile.x` reads stay valid.
export const profile: Profile = loadInitial();

export const accounts = [
  {
    id: "cur",
    type: "Current Account",
    get masked() {
      return `XXXX XXXX ${(profile.accountNumber || "").slice(-4)}`;
    },
    get accountNumber() {
      return profile.accountNumber;
    },
    get ifsc() {
      return profile.ifsc;
    },
    get branch() {
      return profile.branch;
    },
    get customerId() {
      return profile.customerId;
    },
    status: "Active",
    balance: 0,
    primary: true,
    color: "from-blue-700 via-indigo-700 to-slate-900",
  },
];

// ---- subscription / hook ---------------------------------------------------
type Listener = () => void;
const listeners = new Set<Listener>();
let version = 0;

export function subscribeBanking(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  version++;
  for (const l of listeners) l();
}

export function setBankingData(patch: Partial<Profile>) {
  Object.assign(profile, patch);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {}
  emit();
}

export function resetBankingData() {
  Object.assign(profile, DEFAULT_PROFILE);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  emit();
}

/** Subscribe a component to data changes — forces re-render on update. */
export function useBankingStore() {
  return useSyncExternalStore(
    (fn) => subscribeBanking(fn),
    () => version,
    () => version,
  );
}

export function computeCurrentBalance(
  txns: ReadonlyArray<{ credit?: number; debit?: number }>,
  opening: number = accounts[0]?.balance ?? 0,
): number {
  let bal = opening;
  for (const t of txns) bal += (t.credit || 0) - (t.debit || 0);
  return bal;
}

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
