import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Car, Home, Plane, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/insurance")({ component: Insurance });

const items = [
  { l: "Health Insurance", i: Heart },
  { l: "Car Insurance", i: Car },
  { l: "Home Insurance", i: Home },
  { l: "Travel Insurance", i: Plane },
  { l: "Life Insurance", i: ShieldCheck },
];

function Insurance() {
  return (
    <AppLayout>
      <PageHeader title="Insurance" subtitle="Protect what matters" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((x) => (
          <Card key={x.l} className="p-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-gold text-gold-foreground flex items-center justify-center mb-3"><x.i className="w-6 h-6" /></div>
            <div className="font-bold">{x.l}</div>
            <div className="text-xs text-muted-foreground">Premium plans starting from ₹499/mo</div>
            <Button className="mt-3 w-full bg-gradient-primary" size="sm" onClick={() => toast.success("Quote requested")}>Get Quote</Button>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}