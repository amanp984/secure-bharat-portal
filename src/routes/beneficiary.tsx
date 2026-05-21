import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { beneficiaries } from "@/lib/banking-data";
import { UserPlus, Trash2, Send } from "lucide-react";
import { useBankingModal } from "@/components/banking/ModalContext";

export const Route = createFileRoute("/beneficiary")({ component: BeneficiaryPage });

function BeneficiaryPage() {
  const modal = useBankingModal();
  return (
    <AppLayout>
      <PageHeader title="Manage Beneficiary" subtitle="Your saved payees"
        action={<Button onClick={() => modal.show("beneficiary-restricted")} className="bg-gradient-primary"><UserPlus className="w-4 h-4 mr-1" />Add Beneficiary</Button>}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {beneficiaries.map((b) => (
          <Card key={b.id} className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-gold text-gold-foreground flex items-center justify-center font-bold">
                {b.name.split(" ").map((p) => p[0]).join("")}
              </div>
              <div>
                <div className="font-semibold">{b.name}</div>
                <div className="text-xs text-muted-foreground">{b.bank}</div>
              </div>
            </div>
            <div className="text-xs space-y-1 mb-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Account</span><span className="font-mono">{b.acc}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last Transfer</span><span>{b.last}</span></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-gradient-primary"><Send className="w-3.5 h-3.5 mr-1" />Quick Transfer</Button>
              <Button size="sm" variant="outline" onClick={() => modal.show("beneficiary-restricted")}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}