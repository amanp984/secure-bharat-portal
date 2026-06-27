import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, History, MonitorSmartphone, Bell, Lock } from "lucide-react";

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

function Settings() {
  const logins = [
    { d: "21 May 2026 09:42", dev: "Chrome · Windows · Jaipur", ok: true },
    { d: "20 May 2026 21:10", dev: "Mobile App · Android · Jaipur", ok: true },
    { d: "18 May 2026 14:33", dev: "Safari · iPhone · Bengaluru", ok: true },
    { d: "15 May 2026 02:11", dev: "Unknown · Delhi", ok: false },
  ];
  return (
    <AppLayout>
      <PageHeader title="Security Center" subtitle="Settings, sessions & device management" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="font-bold mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-success" />Security Settings</h2>
          {[
            { l: "Two-Factor Authentication", i: Lock, on: true },
            { l: "Login Notifications", i: Bell, on: true },
            { l: "Trusted Device Mode", i: MonitorSmartphone, on: false },
          ].map((s) => (
            <div key={s.l} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 mb-2">
              <div className="flex items-center gap-3"><s.i className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{s.l}</span></div>
              <Switch defaultChecked={s.on} />
            </div>
          ))}
        </Card>
        <Card className="p-5">
          <h2 className="font-bold mb-3 flex items-center gap-2"><History className="w-4 h-4 text-primary" />Login History</h2>
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
        </Card>
      </div>
    </AppLayout>
  );
}