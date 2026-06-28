import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Save, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  profile,
  setBankingData,
  resetBankingData,
  useBankingStore,
  type Profile,
} from "@/lib/banking-data";

export const Route = createFileRoute("/dashboard-settings")({
  component: DashboardSettings,
  head: () => ({
    meta: [{ title: "Dashboard Settings — Indian One" }],
  }),
});

const SETTINGS_PASSWORD = "USER1947";
const UNLOCK_KEY = "indian_one_dashboard_settings_unlocked";

const FIELDS: { key: keyof Profile; label: string; type?: string; full?: boolean }[] = [
  { key: "fullName", label: "Holder Name" },
  { key: "customerId", label: "Customer ID" },
  { key: "accountNumber", label: "Account Number" },
  { key: "username", label: "Username" },
  { key: "password", label: "Login Password", type: "text" },
  { key: "ifsc", label: "IFSC" },
  { key: "micr", label: "MICR Code" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile Number" },
  { key: "address", label: "Residential Address", full: true },
  { key: "branchAddress", label: "Branch Address", full: true },
  { key: "upiUsername", label: "UPI Username" },
  { key: "upiId", label: "UPI ID" },
  { key: "registeredPhone", label: "Registered Phone" },
  { key: "cardholderName", label: "Cardholder Name" },
  { key: "bankName", label: "Bank Name" },
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
                  toast.error("Incorrect password");
                  setPwd("");
                }
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <Label htmlFor="ds-pwd" className="text-xs">
                  Password
                </Label>
                <Input
                  id="ds-pwd"
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                Unlock
              </Button>
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
  const [draft, setDraft] = useState<Profile>({ ...profile });

  const update = (k: keyof Profile, v: string) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = () => {
    setBankingData(draft);
    toast.success("Changes saved — applied across the application");
  };

  const handleReset = () => {
    if (!confirm("Reset all customer data to defaults?")) return;
    resetBankingData();
    setDraft({ ...profile });
    toast.success("Customer data reset to defaults");
  };

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard Settings"
        subtitle="Edit live customer & account data — applied instantly"
      />
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 text-xs text-success">
          <ShieldCheck className="w-4 h-4" />
          <span>Changes save instantly. No redeploy required.</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div
              key={f.key}
              className={"space-y-1.5 " + (f.full ? "sm:col-span-2" : "")}
            >
              <Label htmlFor={`f-${f.key}`} className="text-xs">
                {f.label}
              </Label>
              <Input
                id={`f-${f.key}`}
                type={f.type || "text"}
                value={String(draft[f.key] ?? "")}
                onChange={(e) => update(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <Button onClick={handleSave} className="gap-1.5">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
          <Button variant="outline" onClick={() => setDraft({ ...profile })}>
            Discard
          </Button>
          <Button variant="ghost" onClick={handleReset} className="gap-1.5 text-destructive">
            <RotateCcw className="w-4 h-4" /> Reset to Defaults
          </Button>
        </div>
      </Card>
    </AppLayout>
  );
}
