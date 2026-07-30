import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, Pencil, Trash2, Plus, ListOrdered } from "lucide-react";
import { useTransactions, type UiTransaction } from "@/hooks/useTransactions";
import {
  adminCreateTransaction,
  adminUpdateTransaction,
  adminDeleteTransaction,
  type AdminTxnRow,
} from "@/lib/admin-transactions";

const MODES = ["UPI", "IMPS", "NEFT", "RTGS", "Cash", "ATM", "Card"] as const;
const STATUSES = ["Success", "Pending", "Failed"] as const;

type FormState = {
  date: string;
  time: string;
  amount: string;
  name: string;
  reference: string;
  narration: string;
  type: "Credit" | "Debit";
  mode: string;
  status: string;
};

const emptyForm = (): FormState => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    amount: "",
    name: "",
    reference: "",
    narration: "",
    type: "Credit",
    mode: "UPI",
    status: "Success",
  };
};

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusOf(t: UiTransaction): string {
  const hay = `${t.rawSms || ""} ${t.narration || ""}`.toUpperCase();
  if (/FAIL|DECLIN|REVERS/.test(hay)) return "Failed";
  if (/PENDING/.test(hay)) return "Pending";
  return "Success";
}

function toForm(t: UiTransaction): FormState {
  const d = new Date(t.sortTs);
  const pad = (n: number) => String(n).padStart(2, "0");
  const modeMatch = MODES.find((m) => (t.narration || "").toUpperCase().includes(m.toUpperCase()));
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    amount: String(t.credit || t.debit || 0),
    name: t.narration?.split(" / ")[2] || "",
    reference: t.reference || "",
    narration: t.rawSms || t.narration || "",
    type: t.type,
    mode: modeMatch || "UPI",
    status: statusOf(t),
  };
}

function toRow(f: FormState): AdminTxnRow {
  const iso = new Date(`${f.date}T${f.time || "00:00"}:00`).toISOString();
  return {
    amount: Number(f.amount) || 0,
    transaction_type: f.type === "Credit" ? "credit" : "debit",
    sender_name: f.name.trim() || null,
    transaction_reference: f.reference.trim() || null,
    bank_name: f.mode,
    account_number_last4: null,
    message: f.narration.trim() || null,
    transaction_date: iso,
  };
}

export function TransactionManager() {
  const { transactions, loading } = useTransactions();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<UiTransaction | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [viewing, setViewing] = useState<UiTransaction | null>(null);
  const [deleting, setDeleting] = useState<UiTransaction | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => transactions, [transactions]);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setEdit = (k: keyof FormState, v: string) => setEditForm((f) => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setBusy(true);
    try {
      await adminCreateTransaction(toRow(form));
      toast.success("Transaction added");
      setForm(emptyForm());
    } catch (e) {
      toast.error((e as Error).message || "Could not add transaction");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      await adminUpdateTransaction(editing.id, toRow(editForm));
      toast.success("Transaction updated");
      setEditing(null);
    } catch (e) {
      toast.error((e as Error).message || "Could not update transaction");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminDeleteTransaction(deleting.id);
      toast.success("Transaction deleted");
      setDeleting(null);
    } catch (e) {
      toast.error((e as Error).message || "Could not delete transaction");
    } finally {
      setBusy(false);
    }
  };

  const fields = (f: FormState, upd: (k: keyof FormState, v: string) => void, prefix: string) => (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-date`} className="text-xs">Date</Label>
        <Input id={`${prefix}-date`} type="date" value={f.date} onChange={(e) => upd("date", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-time`} className="text-xs">Time</Label>
        <Input id={`${prefix}-time`} type="time" value={f.time} onChange={(e) => upd("time", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-amount`} className="text-xs">Amount</Label>
        <Input id={`${prefix}-amount`} inputMode="decimal" value={f.amount} onChange={(e) => upd("amount", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-name`} className="text-xs">Customer Name</Label>
        <Input id={`${prefix}-name`} value={f.name} onChange={(e) => upd("name", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-ref`} className="text-xs">UTR / Reference</Label>
        <Input id={`${prefix}-ref`} value={f.reference} onChange={(e) => upd("reference", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-type`} className="text-xs">Transaction Type</Label>
        <Select value={f.type} onValueChange={(v) => upd("type", v)}>
          <SelectTrigger id={`${prefix}-type`}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Credit">Credit</SelectItem>
            <SelectItem value="Debit">Debit</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-mode`} className="text-xs">Transfer Mode</Label>
        <Select value={f.mode} onValueChange={(v) => upd("mode", v)}>
          <SelectTrigger id={`${prefix}-mode`}><SelectValue /></SelectTrigger>
          <SelectContent>
            {MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-status`} className="text-xs">Status</Label>
        <Select value={f.status} onValueChange={(v) => upd("status", v)}>
          <SelectTrigger id={`${prefix}-status`}><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${prefix}-narr`} className="text-xs">Narration</Label>
        <Input id={`${prefix}-narr`} value={f.narration} onChange={(e) => upd("narration", e.target.value)} />
      </div>
    </div>
  );

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <ListOrdered className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm tracking-wide">Transaction Manager</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {loading ? "Loading ledger…" : `${rows.length} transactions in the live ledger.`}
        </p>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                {["Date & Time", "Type", "Amount", "Customer Name", "UTR / Ref", "Narration", "Balance", "Status", ""].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(t.sortTs).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <span className={t.type === "Credit" ? "text-success" : "text-destructive"}>{t.type}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">{inr(t.credit || t.debit)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{t.narration?.split(" / ")[2] || "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{t.reference || "—"}</td>
                  <td className="px-3 py-2 max-w-[240px] truncate" title={t.narration}>{t.narration}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{inr(t.balance)}</td>
                  <td className="px-3 py-2">{statusOf(t)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" aria-label="View" onClick={() => setViewing(t)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => { setEditing(t); setEditForm(toForm(t)); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" aria-label="Delete" className="text-destructive" onClick={() => setDeleting(t)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && !loading && (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm tracking-wide">Add Transaction</h2>
        </div>
        {fields(form, set, "add")}
        <Button className="mt-4 gap-1.5" onClick={handleAdd} disabled={busy}>
          <Plus className="w-4 h-4" /> Add Transaction
        </Button>
      </Card>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Read-only view of this ledger entry.</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-xs">
              {[
                ["Date & Time", new Date(viewing.sortTs).toLocaleString("en-IN")],
                ["Type", viewing.type],
                ["Amount", inr(viewing.credit || viewing.debit)],
                ["UTR / Reference", viewing.reference || "—"],
                ["Narration", viewing.narration],
                ["Balance", inr(viewing.balance)],
                ["Status", statusOf(viewing)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b pb-1">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-right font-medium break-all">{v}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && !busy && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Changes apply instantly across the app.</DialogDescription>
          </DialogHeader>
          {fields(editForm, setEdit, "edit")}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditing(null)} disabled={busy}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && !busy && setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this transaction?</DialogTitle>
            <DialogDescription>This cannot be undone. Balances recalculate automatically.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={busy}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={busy}>
              {busy ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
