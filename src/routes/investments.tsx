import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { TrendingUp, LineChart, Coins, Gem } from "lucide-react";

export const Route = createFileRoute("/investments")({
  component: Investments,
  head: () => ({
    meta: [
      { title: "Investments — Bharat Bank" },
      { name: "description", content: "Track your mutual funds, stocks, gold bonds, PPF and NPS investments in one view." },
      { property: "og:title", content: "Investments — Bharat Bank" },
      { property: "og:description", content: "Track your mutual funds, stocks, gold bonds, PPF and NPS investments in one view." },
      { property: "og:url", content: "https://indbanksample.lovable.app/investments" },
    ],
    links: [{ rel: "canonical", href: "https://indbanksample.lovable.app/investments" }],
  }),
});

function Investments() {
  return (
    <AppLayout>
      <PageHeader title="Investments" subtitle="Mutual funds, stocks, bonds & more" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Mutual Funds", i: LineChart, v: "₹1,24,830", c: "+12.4%" },
          { l: "Stocks", i: TrendingUp, v: "₹2,48,210", c: "+8.1%" },
          { l: "Gold Bonds", i: Gem, v: "₹56,400", c: "+5.7%" },
          { l: "PPF / NPS", i: Coins, v: "₹4,82,000", c: "+7.1%" },
        ].map((x) => (
          <Card key={x.l} className="p-5">
            <x.i className="w-6 h-6 text-primary mb-3" />
            <div className="text-xs text-muted-foreground">{x.l}</div>
            <div className="text-xl font-bold">{x.v}</div>
            <div className="text-xs text-success font-semibold">{x.c} YoY</div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}