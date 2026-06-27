import { useQuery, useQueryClient } from "@tanstack/react-query";

/** Live customer profile returned by /api/profile (no password fields). */
export interface LiveProfile {
  id: string;
  holder_name: string;
  customer_id: string;
  account_number: string;
  username: string;
  ifsc: string;
  micr: string;
  email: string;
  mobile: string;
  address: string;
  branch_name: string;
  branch_address: string;
  opening_balance: number;
  updated_at: string;
}

/** UI-friendly profile mirroring the legacy `profile` + `accounts[0]` shape. */
export interface ProfileView {
  loaded: boolean;
  // Identity
  fullName: string;
  customerId: string;
  accountNumber: string;
  username: string;
  ifsc: string;
  micr: string;
  mobile: string;
  email: string;
  address: string;
  branch: string;
  branchAddress: string;
  // Derived display
  masked: string;
  initials: string;
  // Account-ish
  accountType: string;
  accountStatus: string;
  kycStatus: string;
  nominee: string;
  openedOn: string;
  aadhaar: string;
  pan: string;
  occupation: string;
  customerCategory: string;
  lastLogin: string;
  cardGradient: string;
  openingBalance: number;
}

const DEFAULTS = {
  accountType: "Current Account",
  accountStatus: "Active",
  kycStatus: "Verified",
  nominee: "Sachin (Spouse)",
  openedOn: "14 March 2018",
  aadhaar: "XXXX XXXX 3671",
  pan: "AXXXX0000X",
  occupation: "Business Owner",
  customerCategory: "Priority Customer",
  lastLogin: "Just now",
  cardGradient: "from-blue-700 via-indigo-700 to-slate-900",
};

function toInitials(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function toMasked(account: string): string {
  const last4 = (account || "").slice(-4).padStart(4, "X");
  return `XXXX XXXX ${last4}`;
}

function build(p: LiveProfile | undefined, loaded: boolean): ProfileView {
  const r = p || ({} as Partial<LiveProfile>);
  const accountNumber = String(r.account_number || "");
  return {
    loaded,
    fullName: r.holder_name || "—",
    customerId: r.customer_id || "—",
    accountNumber,
    username: r.username || "",
    ifsc: r.ifsc || "—",
    micr: r.micr || "—",
    mobile: r.mobile || "—",
    email: r.email || "—",
    address: r.address || "—",
    branch: r.branch_name || "—",
    branchAddress: r.branch_address || "—",
    masked: toMasked(accountNumber),
    initials: toInitials(r.holder_name || ""),
    openingBalance: Number(r.opening_balance ?? 0),
    ...DEFAULTS,
  };
}

const QK = ["profile"] as const;

export function useProfile(): ProfileView {
  const q = useQuery({
    queryKey: QK,
    queryFn: async (): Promise<LiveProfile> => {
      const r = await fetch("/api/profile", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const body = await r.json();
      return body.profile as LiveProfile;
    },
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
  return build(q.data, !q.isLoading);
}

/** Force a refresh after admin edits. */
export function useRefreshProfile() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: QK });
}
