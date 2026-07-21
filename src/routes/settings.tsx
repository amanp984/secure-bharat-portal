import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  ShieldCheck, History, MonitorSmartphone, Bell, Lock,
  User, CreditCard, Wallet, HandCoins, PiggyBank, Repeat,
  Heart, Users, FileText, Download, BadgeCheck, UserCheck,
  MapPin, MessageSquare, EyeOff, AlertCircle, Headphones, Phone,
} from "lucide-react";
import { profile, useBankingStore } from "@/lib/banking-data";

export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({
    meta: [
      { title: "Settings — Indian One" },
      { name: "description", content: "Update your Indian One profile, security, notifications and net banking preferences." },
      { property: "og:title", content: "Settings — Indian One" },
      { property: "og:description", content: "Update your Indian One profile, security, notifications and net banking preferences." },
      { property: "og:url", content: "https://www.indianone.in/settings" },
    ],
    links: [{ rel: "canonical", href: "https://www.indianone.in/settings" }],
  }),
});

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-3 py-2 border-b border-border/60 last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right break-words">{value}</span>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <h2 className="font-bold mb-3 flex items-center gap-2 text-sm">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </h2>
      <div>{children}</div>
    </Card>
  );
}

function Settings() {
  useBankingStore();

  const logins = [
    { d: "21 May 2026 09:42", dev: "Chrome · Windows · Mumbai", ok: true },
    { d: "20 May 2026 21:10", dev: "Mobile App · Android · Mumbai", ok: true },
    { d: "18 May 2026 14:33", dev: "Safari · iPhone · Bengaluru", ok: true },
    { d: "15 May 2026 02:11", dev: "Unknown · Delhi", ok: false },
  ];

  return (
    <AppLayout>
      <PageHeader title="Security Center" subtitle="Settings, sessions & device management" />

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard icon={ShieldCheck} title="Security Settings">
          {[
            { l: "Two-Factor Authentication", i: Lock, on: profile.twoFactor === "Enabled" },
            { l: "Login Notifications", i: Bell, on: profile.loginNotification === "Enabled" },
            { l: "Trusted Device Mode", i: MonitorSmartphone, on: false },
          ].map((s) => (
            <div key={s.l} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 mb-2">
              <div className="flex items-center gap-3"><s.i className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{s.l}</span></div>
              <Switch defaultChecked={s.on} />
            </div>
          ))}
        </SectionCard>

        <SectionCard icon={History} title="Login History">
          <div className="divide-y">
            {logins.map((l, i) => (
              <div key={i} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <div className="font-medium">{l.d}</div>
                  <div className="text-xs text-muted-foreground">{l.dev}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${l.ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{l.ok ? "Verified" : "Flagged"}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={User} title="Account Information">
          <InfoRow label="Holder" value={profile.fullName} />
          <InfoRow label="Customer ID" value={profile.customerId} />
          <InfoRow label="Account Number" value={profile.accountNumber} />
          <InfoRow label="IFSC" value={profile.ifsc} />
          <InfoRow label="Branch" value={profile.branch} />
          <InfoRow label="Currency" value={profile.currency} />
        </SectionCard>

        <SectionCard icon={CreditCard} title="Cards">
          <InfoRow label="Debit Card" value={profile.debitCard} />
          <InfoRow label="Credit Card" value={profile.creditCard} />
          <InfoRow label="Card Status" value={profile.cardStatus} />
          <InfoRow label="Card Limit" value={`₹ ${profile.cardLimit}`} />
        </SectionCard>

        <SectionCard icon={Wallet} title="Transaction Limits">
          <InfoRow label="UPI Daily" value={`₹ ${profile.upiDailyLimit}`} />
          <InfoRow label="UPI Per Txn" value={`₹ ${profile.upiPerTxnLimit}`} />
          <InfoRow label="IMPS" value={`₹ ${profile.impsLimit}`} />
          <InfoRow label="NEFT" value={`₹ ${profile.neftLimit}`} />
          <InfoRow label="RTGS" value={`₹ ${profile.rtgsLimit}`} />
          <InfoRow label="ATM" value={`₹ ${profile.atmLimit}`} />
          <InfoRow label="Cash Withdrawal" value={`₹ ${profile.cashWithdrawalLimit}`} />
        </SectionCard>

        <SectionCard icon={HandCoins} title="Loans">
          <InfoRow label="Personal Loan" value={profile.personalLoan} />
          <InfoRow label="Home Loan" value={profile.homeLoan} />
          <InfoRow label="Car Loan" value={profile.carLoan} />
          <InfoRow label="Gold Loan" value={profile.goldLoan} />
          <InfoRow label="Offers" value={profile.loanOffers} />
        </SectionCard>

        <SectionCard icon={PiggyBank} title="Fixed Deposits">
          <InfoRow label="Active FD" value={profile.fd} />
          <InfoRow label="Interest Rate" value={profile.interestRate} />
        </SectionCard>

        <SectionCard icon={Repeat} title="Recurring Deposits">
          <InfoRow label="Active RD" value={profile.rd} />
          <InfoRow label="Interest Rate" value={profile.interestRate} />
        </SectionCard>

        <SectionCard icon={Heart} title="Insurance">
          <InfoRow label="Life Insurance" value={profile.lifeInsurance} />
          <InfoRow label="Health Insurance" value={profile.healthInsurance} />
          <InfoRow label="Vehicle Insurance" value={profile.vehicleInsurance} />
        </SectionCard>

        <SectionCard icon={Users} title="Beneficiaries">
          <p className="text-sm text-muted-foreground">Manage beneficiaries from the Fund Transfer page.</p>
        </SectionCard>

        <SectionCard icon={FileText} title="Tax Documents">
          <p className="text-sm text-muted-foreground">Form 16A, TDS certificates and Interest certificates available on request.</p>
        </SectionCard>

        <SectionCard icon={Download} title="Statements">
          <p className="text-sm text-muted-foreground">Download account statements from Accounts → Statement.</p>
        </SectionCard>

        <SectionCard icon={User} title="Profile">
          <InfoRow label="Name" value={profile.fullName} />
          <InfoRow label="Mobile" value={profile.mobile} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Occupation" value={profile.occupation} />
        </SectionCard>

        <SectionCard icon={BadgeCheck} title="KYC">
          <InfoRow label="Status" value={profile.kycStatus} />
          <InfoRow label="PAN" value={profile.pan} />
          <InfoRow label="Aadhaar" value={profile.aadhaar} />
        </SectionCard>

        <SectionCard icon={UserCheck} title="Nominee">
          <InfoRow label="Nominee" value={profile.nominee} />
        </SectionCard>

        <SectionCard icon={MapPin} title="Addresses">
          <InfoRow label="Residential" value={profile.address} />
          <InfoRow label="Branch" value={profile.branchAddress} />
        </SectionCard>

        <SectionCard icon={MessageSquare} title="Communication Preferences">
          <div className="space-y-2">
            {["Email Alerts", "SMS Alerts", "WhatsApp Alerts", "Marketing Updates"].map((l) => (
              <div key={l} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <span className="text-sm font-medium">{l}</span>
                <Switch defaultChecked={l !== "Marketing Updates"} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={ShieldCheck} title="Security">
          <InfoRow label="Two Factor" value={profile.twoFactor} />
          <InfoRow label="Login Notification" value={profile.loginNotification} />
          <InfoRow label="Trusted Devices" value={profile.trustedDevices} />
          <InfoRow label="Device Sessions" value={profile.deviceSessions} />
        </SectionCard>

        <SectionCard icon={EyeOff} title="Privacy">
          <div className="space-y-2">
            {["Hide Balance on Dashboard", "Mask Account Number", "Anonymous Analytics"].map((l) => (
              <div key={l} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <span className="text-sm font-medium">{l}</span>
                <Switch />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Bell} title="Notifications">
          <div className="space-y-2">
            {["Transaction Alerts", "Login Alerts", "Offers & Promotions", "Statement Ready"].map((l) => (
              <div key={l} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <span className="text-sm font-medium">{l}</span>
                <Switch defaultChecked={l !== "Offers & Promotions"} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={AlertCircle} title="Report Fraud">
          <InfoRow label="24×7 Helpline" value={profile.reportFraud} />
          <InfoRow label="Freeze Account" value={profile.freezeAccount} />
          <InfoRow label="Block Cards" value={profile.blockCards} />
        </SectionCard>

        <SectionCard icon={Headphones} title="Support">
          <p className="text-sm text-muted-foreground">Reach out via the Support page for service requests and complaints.</p>
        </SectionCard>

        <SectionCard icon={Phone} title="Contact Bank">
          <InfoRow label="Toll Free" value="1800-572-9900" />
          <InfoRow label="Email" value="care@indianone.in" />
          <InfoRow label="Branch" value={profile.branch} />
        </SectionCard>
      </div>
    </AppLayout>
  );
}
