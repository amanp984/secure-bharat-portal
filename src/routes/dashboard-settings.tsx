import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Save, ShieldCheck, RotateCcw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import {
  profile,
  setBankingData,
  resetBankingData,
  useBankingStore,
  type Profile,
} from "@/lib/banking-data";
import { destroyOtherSessions } from "@/lib/session-control";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard-settings")({
  component: DashboardSettings,
  head: () => ({
    meta: [{ title: "Dashboard Settings — Indian One" }],
  }),
});

const SETTINGS_PASSWORD = "USER1947";
const UNLOCK_KEY = "indian_one_dashboard_settings_unlocked";

type Field = { key: keyof Profile; label: string; type?: string; full?: boolean };
type Section = { title: string; fields: Field[] };

const SECTIONS: Section[] = [
  {
    title: "Customer Profile",
    fields: [
      { key: "fullName", label: "Name" },
      { key: "customerId", label: "Customer ID" },
      { key: "username", label: "Username" },
      { key: "password", label: "Password", type: "text" },
      { key: "mobile", label: "Mobile" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address", full: true },
      { key: "branch", label: "Branch" },
      { key: "bankName", label: "Bank Name" },
      { key: "accountNumber", label: "Account Number" },
      { key: "ifsc", label: "IFSC" },
      { key: "micr", label: "MICR" },
    ],
  },
  {
    title: "Bank Details",
    fields: [
      { key: "branch", label: "Branch Name" },
      { key: "branchAddress", label: "Branch Address", full: true },
      { key: "accountStatus", label: "Account Status" },
      { key: "accountType", label: "Account Type" },
      { key: "currency", label: "Currency" },
    ],
  },
  {
    title: "Financial Controls",
    fields: [
      { key: "currentBalance", label: "Current Balance" },
      { key: "availableBalance", label: "Available Balance" },
      { key: "openingBalance", label: "Opening Balance" },
    ],
  },
  {
    title: "Transaction Limits",
    fields: [
      { key: "upiDailyLimit", label: "UPI Daily Limit" },
      { key: "upiPerTxnLimit", label: "UPI Per Transaction" },
      { key: "impsLimit", label: "IMPS Limit" },
      { key: "neftLimit", label: "NEFT Limit" },
      { key: "rtgsLimit", label: "RTGS Limit" },
      { key: "cashWithdrawalLimit", label: "Cash Withdrawal Limit" },
      { key: "atmLimit", label: "ATM Limit" },
      { key: "debitCardLimit", label: "Debit Card Limit" },
      { key: "creditCardLimit", label: "Credit Card Limit" },
    ],
  },
  {
    title: "Cards",
    fields: [
      { key: "debitCard", label: "Debit Card" },
      { key: "creditCard", label: "Credit Card" },
      { key: "cardStatus", label: "Card Status" },
      { key: "cardLimit", label: "Card Limit" },
    ],
  },
  {
    title: "Loans",
    fields: [
      { key: "personalLoan", label: "Personal Loan" },
      { key: "homeLoan", label: "Home Loan" },
      { key: "carLoan", label: "Car Loan" },
      { key: "goldLoan", label: "Gold Loan" },
      { key: "loanOffers", label: "Loan Offers", full: true },
    ],
  },
  {
    title: "Deposits",
    fields: [
      { key: "fd", label: "FD" },
      { key: "rd", label: "RD" },
      { key: "interestRate", label: "Interest Rate" },
    ],
  },
  {
    title: "Insurance",
    fields: [
      { key: "lifeInsurance", label: "Life Insurance" },
      { key: "healthInsurance", label: "Health Insurance" },
      { key: "vehicleInsurance", label: "Vehicle Insurance" },
    ],
  },
  {
    title: "Security",
    fields: [
      { key: "twoFactor", label: "Two Factor" },
      { key: "loginNotification", label: "Login Notification" },
      { key: "trustedDevices", label: "Trusted Devices" },
      { key: "deviceSessions", label: "Device Sessions" },
    ],
  },
  {
    title: "Support",
    fields: [
      { key: "reportFraud", label: "Report Fraud" },
      { key: "freezeAccount", label: "Freeze Account" },
      { key: "blockCards", label: "Block Cards" },
    ],
  },
];

function DashboardSettings() {
  useBankingStore();
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(UNLOCK_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [pwd, setPwd] = useState("");

  if (!unlocked) {
    return (
      <AppLayout>
        <PageHeader title="Dashboard Settings" subtitle="Authorized personnel only" />
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              <h2 className="font-bold">Enter access password</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Dashboard Settings is protected. Please authenticate to continue.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (pwd === SETTINGS_PASSWORD) {
                  try {
                    sessionStorage.setItem(UNLOCK_KEY, "1");
                  } catch {}
                  setUnlocked(true);
                  toast.success("Dashboard Settings unlocked");
                } else {
                  toast.error("Invalid Password");
                  setPwd("");
                }
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <Label htmlFor="ds-pwd" className="text-xs">Password</Label>
                <Input
                  id="ds-pwd"
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">Unlock</Button>
            </form>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return <SettingsForm />;
}

function SettingsForm() {
  useBankingStore();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Profile>({ ...profile });
  const [confirmDestroy, setConfirmDestroy] = useState(false);
  const [destroying, setDestroying] = useState(false);

  const update = (k: keyof Profile, v: string) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = () => {
    setBankingData(draft);
    toast.success("Changes saved successfully.");
    setTimeout(() => {
      navigate({ to: "/" });
    }, 400);
  };

  const handleReset = () => {
    if (!confirm("Reset all customer data to defaults?")) return;
    resetBankingData();
    setDraft({ ...profile });
    toast.success("Customer data reset to defaults");
  };

  const handleDestroyOthers = async () => {
    setDestroying(true);
    try {
      await destroyOtherSessions();
      toast.success("All other sessions have been destroyed.");
    } catch {
      toast.error("Could not destroy other sessions. Please try again.");
    } finally {
      setDestroying(false);
      setConfirmDestroy(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard Settings"
        subtitle="Edit live customer & account data — applied instantly"
      />

      <div className="flex items-center gap-2 mb-4 text-xs text-success">
        <ShieldCheck className="w-4 h-4" />
        <span>Changes save instantly. No redeploy required.</span>
      </div>

      <div className="space-y-5">
        {SECTIONS.map((section) => (
          <Card key={section.title} className="p-6">
            <h2 className="font-bold mb-4 text-sm tracking-wide">{section.title}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {section.fields.map((f) => (
                <div
                  key={`${section.title}-${f.key}`}
                  className={"space-y-1.5 " + (f.full ? "sm:col-span-2" : "")}
                >
                  <Label htmlFor={`f-${section.title}-${f.key}`} className="text-xs">
                    {f.label}
                  </Label>
                  <Input
                    id={`f-${section.title}-${f.key}`}
                    type={f.type || "text"}
                    value={String(draft[f.key] ?? "")}
                    onChange={(e) => update(f.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}

        <Card className="p-6 border-destructive/40">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-destructive" />
            <h2 className="font-bold text-sm tracking-wide">Security Administration</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Force-logout every other device that is currently signed in. Your current device will remain active.
          </p>
          <Button
            variant="destructive"
            onClick={() => setConfirmDestroy(true)}
            className="gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" /> Destroy Other Sessions
          </Button>
        </Card>
      </div>

      <div className="sticky bottom-4 mt-6">
        <Card className="p-4 flex flex-wrap gap-2 shadow-lg">
          <Button onClick={handleSave} className="gap-1.5">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
          <Button variant="outline" onClick={() => setDraft({ ...profile })}>
            Discard
          </Button>
          <Button variant="ghost" onClick={handleReset} className="gap-1.5 text-destructive">
            <RotateCcw className="w-4 h-4" /> Reset to Defaults
          </Button>
        </Card>
      </div>

      <Dialog open={confirmDestroy} onOpenChange={(o) => !destroying && setConfirmDestroy(o)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Destroy all other active login sessions?</DialogTitle>
            <DialogDescription>Current device will remain logged in.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmDestroy(false)} disabled={destroying}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDestroyOthers} disabled={destroying}>
              {destroying ? "Destroying…" : "Destroy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

