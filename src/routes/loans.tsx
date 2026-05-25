import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Car, GraduationCap, Briefcase, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/loans")({
  component: Loans,
  head: () => ({
    meta: [
      { title: "Loans — Indian Bank One" },
      { name: "description", content: "Apply for home, car, education, personal and pre-approved loans with Indian Bank One." },
      { property: "og:title", content: "Loans — Indian Bank One" },
      { property: "og:description", content: "Apply for home, car, education, personal and pre-approved loans with Indian Bank One." },
      { property: "og:url", content: "https://www.indianbankone.in/loans" },
    ],
    links: [{ rel: "canonical", href: "https://www.indianbankone.in/loans" }],
  }),
});

const items = [
  { label: "Home Loan", icon: Home, rate: "8.50%", color: "from-blue-500 to-indigo-600" },
  { label: "Car Loan", icon: Car, rate: "9.25%", color: "from-emerald-500 to-teal-600" },
  { label: "Education Loan", icon: GraduationCap, rate: "10.10%", color: "from-amber-500 to-orange-600" },
  { label: "Personal Loan", icon: Briefcase, rate: "11.50%", color: "from-fuchsia-500 to-purple-600" },
  { label: "Loan Against FD", icon: Heart, rate: "FD+1%", color: "from-rose-500 to-red-600" },
  { label: "Pre-approved", icon: Sparkles, rate: "Instant", color: "from-yellow-500 to-amber-600" },
];

function Loans() {
  return (
    <AppLayout>
      <PageHeader title="Loans" subtitle="Quick approval, transparent rates" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((l) => (
          <Card key={l.label} className="p-5 hover:shadow-elegant transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${l.color} flex items-center justify-center mb-3 shadow-md`}>
              <l.icon className="w-6 h-6 text-white" />
            </div>
            <div className="font-bold">{l.label}</div>
            <div className="text-xs text-muted-foreground">Starting @ <span className="text-primary font-bold">{l.rate}</span> p.a.</div>
            <Button size="sm" className="mt-3 w-full bg-gradient-primary" onClick={() => toast.success(`${l.label} application started`)}>Apply Now</Button>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}