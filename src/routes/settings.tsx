import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShieldCheck, History, MonitorSmartphone, Bell, Lock, KeyRound, Save,
  LogOut, AlertTriangle, Loader2, Eye, EyeOff, ListTree, CheckCircle2, X,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProfile } from "@/hooks/useProfile";
import { getAdminToken, setAdminToken, clearAdminToken } from "@/lib/admin-session";

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

interface AuditEntry {
  id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
}

const FIELDS: { key: string; label: string; type?: "text" | "password" | "number"; hint?: string }[] = [
  { key: "holder_name", label: "Holder Name" },
  { key: "customer_id", label: "Customer ID" },
  { key: "account_number", label: "Account Number", hint: "Masked number auto-derives from last 4 digits" },
  { key: "username", label: "Username (Login)" },
  { key: "password", label: "Password", type: "password" },
  { key: "ifsc", label: "IFSC", hint: "Format: ABCD0XXXXXX" },
  { key: "micr", label: "MICR Code" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile Number" },
  { key: "address", label: "Address" },
  { key: "branch_name", label: "Branch Name" },
  { key: "branch_address", label: "Branch Address" },
  { key: "opening_balance", label: "Available / Opening Balance (INR)", type: "number" },
];

function Settings() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [active, setActive] = useState<boolean>(() => !!getAdminToken());

  const logins = [
    { d: "21 May 2026 09:42", dev: "Chrome · Windows", ok: true },
    { d: "20 May 2026 21:10", dev: "Mobile App · Android", ok: true },
    { d: "18 May 2026 14:33", dev: "Safari · iPhone", ok: true },
    { d: "15 May 2026 02:11", dev: "Unknown · Flagged session", ok: false },
  ];

  return (
    <AppLayout>
      <PageHeader title="Security Center" subtitle="Settings, sessions & administrator tools" />
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

      <Card className="mt-6 p-5 border-amber-200 bg-gradient-to-br from-amber-50/60 to-white dark:from-amber-950/20 dark:to-card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-base flex items-center gap-2">Admin Access
                {active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">ACTIVE</span>}
              </h2>
              <p className="text-xs text-muted-foreground max-w-xl mt-0.5">
                Administrator authentication for Bank Executives only. Unlocks live editing of customer profile fields.
                Every change is logged and applied across the entire platform immediately.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {active && (
              <Button variant="outline" size="sm" onClick={() => { clearAdminToken(); setActive(false); toast.success("Admin Mode locked"); }}>
                <LogOut className="w-3.5 h-3.5 mr-1.5" />Lock Admin
              </Button>
            )}
            <Button size="sm" className="bg-gradient-to-r from-amber-600 to-orange-700 text-white" onClick={() => setAdminOpen(true)}>
              <KeyRound className="w-3.5 h-3.5 mr-1.5" />{active ? "Open Admin Console" : "Enter Admin Mode"}
            </Button>
          </div>
        </div>
      </Card>

      <AdminConsole
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        active={active}
        onActivate={() => setActive(true)}
        onDeactivate={() => setActive(false)}
      />
    </AppLayout>
  );
}

function AdminConsole({
  open, onClose, active, onActivate, onDeactivate,
}: { open: boolean; onClose: () => void; active: boolean; onActivate: () => void; onDeactivate: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only"><DialogTitle>Admin Console</DialogTitle></DialogHeader>
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-200 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Indian One — Admin Console</h2>
              <p className="text-[11px] text-white/70">Restricted access · Authorized executives only</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>
        {active ? (
          <AdminEditor onLock={() => { clearAdminToken(); onDeactivate(); onClose(); }} />
        ) : (
          <AdminLogin onSuccess={(t) => { setAdminToken(t); onActivate(); }} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd) return toast.error("Enter admin password");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(body?.error || "Invalid admin password");
        return;
      }
      onSuccess(body.token as string);
      toast.success("Admin Mode unlocked");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-6 space-y-4 max-w-md mx-auto">
      <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/30 border-amber-200 p-3 flex items-start gap-2 text-[11.5px] text-amber-900 dark:text-amber-100">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <p>All administrator actions are logged with timestamp, field, old value and new value. Unauthorized access is prohibited.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-pwd" className="text-xs">Admin Password</Label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input id="admin-pwd" type={show ? "text" : "password"} value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Enter administrator password" className="pl-9 pr-9" autoComplete="current-password" />
          <button type="button" onClick={() => setShow((v) => !v)} aria-label="Toggle password visibility" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 text-white h-10">
        {loading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Verifying…</> : <>Unlock Admin Mode</>}
      </Button>
    </form>
  );
}

function AdminEditor({ onLock }: { onLock: () => void }) {
  const profile = useProfile();
  const qc = useQueryClient();
  const initial = useMemo<Record<string, string>>(() => ({
    holder_name: profile.fullName === "—" ? "" : profile.fullName,
    customer_id: profile.customerId === "—" ? "" : profile.customerId,
    account_number: profile.accountNumber,
    username: profile.username,
    password: "",
    ifsc: profile.ifsc === "—" ? "" : profile.ifsc,
    micr: profile.micr === "—" ? "" : profile.micr,
    email: profile.email === "—" ? "" : profile.email,
    mobile: profile.mobile === "—" ? "" : profile.mobile,
    address: profile.address === "—" ? "" : profile.address,
    branch_name: profile.branch === "—" ? "" : profile.branch,
    branch_address: profile.branchAddress === "—" ? "" : profile.branchAddress,
    opening_balance: String(profile.openingBalance ?? 0),
  }), [profile.loaded, profile.accountNumber]);

  const [form, setForm] = useState<Record<string, string>>(initial);
  useEffect(() => { setForm(initial); }, [initial]);

  const [saving, setSaving] = useState(false);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  const loadAudit = async () => {
    const token = getAdminToken();
    if (!token) return;
    setAuditLoading(true);
    try {
      const r = await fetch("/api/admin/audit", { headers: { Authorization: `Bearer ${token}` } });
      if (r.status === 401) { toast.error("Admin session expired"); onLock(); return; }
      const body = await r.json();
      setAudit(body.entries || []);
    } catch { toast.error("Failed to load audit log"); }
    finally { setAuditLoading(false); }
  };

  const changes = useMemo(() => {
    const out: Record<string, string | number> = {};
    for (const f of FIELDS) {
      const cur = form[f.key] ?? "";
      const base = initial[f.key] ?? "";
      if (f.key === "password") { if (cur) out[f.key] = cur; continue; }
      if (cur !== base && cur !== "") {
        if (f.key === "opening_balance") out[f.key] = Number(cur);
        else out[f.key] = cur;
      }
    }
    return out;
  }, [form, initial]);

  const save = async () => {
    if (Object.keys(changes).length === 0) return toast.info("No changes to save");
    const token = getAdminToken();
    if (!token) { toast.error("Admin session missing"); onLock(); return; }
    setSaving(true);
    try {
      const r = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ changes }),
      });
      const body = await r.json().catch(() => ({}));
      if (r.status === 401) { toast.error("Admin session expired"); onLock(); return; }
      if (!r.ok) { toast.error(body?.error || "Save failed"); return; }
      toast.success(`Saved · ${body.audited ?? 0} field${body.audited === 1 ? "" : "s"} updated across the platform`);
      qc.invalidateQueries({ queryKey: ["profile"] });
      setForm((f) => ({ ...f, password: "" }));
      if (showAudit) loadAudit();
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  const dirtyCount = Object.keys(changes).length;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          Editing the live customer profile · changes apply instantly across all screens, PDFs and APIs
        </div>
        <Button variant="outline" size="sm" onClick={() => { setShowAudit((v) => !v); if (!showAudit) loadAudit(); }}>
          <ListTree className="w-3.5 h-3.5 mr-1.5" />{showAudit ? "Hide" : "View"} Audit Log
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`af-${f.key}`} className="text-[11px] font-semibold">
              {f.label}
              {form[f.key] !== initial[f.key] && form[f.key] !== "" && (
                <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">modified</span>
              )}
            </Label>
            <Input
              id={`af-${f.key}`}
              type={f.type === "password" ? "password" : f.type === "number" ? "number" : "text"}
              value={form[f.key] ?? ""}
              placeholder={f.key === "password" ? "Leave blank to keep existing password" : f.hint || ""}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              className="h-9"
              autoComplete="off"
            />
            {f.hint && <p className="text-[10px] text-muted-foreground">{f.hint}</p>}
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-secondary/40 p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-[11.5px] text-muted-foreground">
          <b className="text-foreground">{dirtyCount}</b> pending change{dirtyCount === 1 ? "" : "s"}.
          The masked card number will auto-update to <b className="text-foreground">XXXX XXXX {(form.account_number || "").slice(-4) || "—"}</b>.
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setForm(initial)} disabled={dirtyCount === 0 || saving}>Reset</Button>
          <Button onClick={save} disabled={saving || dirtyCount === 0} className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
            {saving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving…</> : <><Save className="w-4 h-4 mr-1.5" />Save Changes</>}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showAudit && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-lg border bg-card">
              <div className="px-4 py-2.5 border-b flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-1.5"><ListTree className="w-4 h-4 text-primary" />Audit Log (latest 50)</h3>
                <Button variant="ghost" size="sm" onClick={loadAudit} disabled={auditLoading}>{auditLoading ? "Loading…" : "Refresh"}</Button>
              </div>
              {audit.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">No audit entries yet.</div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y text-[12px]">
                  {audit.map((e) => (
                    <div key={e.id} className="px-4 py-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold capitalize">{e.field.replace(/_/g, " ")}</div>
                        <div className="text-[10.5px] text-muted-foreground">{new Date(e.changed_at).toLocaleString("en-IN")}</div>
                      </div>
                      <div className="text-[11px] text-right min-w-0">
                        <div className="text-muted-foreground line-through truncate max-w-[260px]">{e.old_value ?? "—"}</div>
                        <div className="font-semibold text-emerald-700 truncate max-w-[260px]">{e.new_value ?? "—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
