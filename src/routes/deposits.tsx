import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { PiggyBank, TrendingUp, Calculator } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/deposits")({
  component: DepositsPage,
  head: () => ({
    meta: [
      { title: "Fixed Deposits — Indian Bank One" },
      { name: "description", content: "Open a fixed deposit, calculate maturity value and explore Indian Bank One FD interest rates." },
      { property: "og:title", content: "Fixed Deposits — Indian Bank One" },
      { property: "og:description", content: "Open a fixed deposit, calculate maturity value and explore Indian Bank One FD interest rates." },
      { property: "og:url", content: "https://www.indianbankone.in/deposits" },
    ],
    links: [{ rel: "canonical", href: "https://www.indianbankone.in/deposits" }],
  }),
});

function DepositsPage() {
  const [amt, setAmt] = useState(100000);
  const [years, setYears] = useState([3]);
  const rate = 7.25;
  const maturity = Math.round(amt * Math.pow(1 + rate / 400, years[0] * 4));
  return (
    <AppLayout>
      <PageHeader title="Fixed & Recurring Deposits" subtitle="Grow your savings safely" />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 bg-gradient-gold text-gold-foreground border-0">
          <PiggyBank className="w-8 h-8 mb-3" />
          <h2 className="font-bold text-lg">Open New FD</h2>
          <p className="text-sm opacity-80 mt-1">Lock in attractive interest rates up to 7.65%</p>
          <Button className="mt-4 bg-foreground text-background hover:bg-foreground/90" onClick={() => toast.success("FD application started")}>Start Now</Button>
        </Card>
        <Card className="p-5 bg-gradient-primary text-primary-foreground border-0">
          <TrendingUp className="w-8 h-8 mb-3" />
          <h2 className="font-bold text-lg">Open New RD</h2>
          <p className="text-sm opacity-80 mt-1">Save monthly with disciplined returns</p>
          <Button className="mt-4 bg-gold text-gold-foreground hover:bg-gold/90" onClick={() => toast.success("RD application started")}>Start Now</Button>
        </Card>
        <Card className="p-5">
          <Calculator className="w-6 h-6 text-primary mb-2" />
          <h2 className="font-bold">FD Calculator</h2>
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Amount (₹)</label>
              <Input type="number" value={amt} onChange={(e) => setAmt(+e.target.value || 0)} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Tenure</span><span className="font-bold">{years[0]} year(s)</span></div>
              <Slider value={years} onValueChange={setYears} max={10} min={1} step={1} />
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <div className="text-xs text-muted-foreground">Maturity Value @ {rate}%</div>
              <div className="text-2xl font-bold text-primary">₹{maturity.toLocaleString("en-IN")}</div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}