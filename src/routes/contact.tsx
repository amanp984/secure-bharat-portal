import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Phone, Globe } from "lucide-react";
import { brand } from "@/lib/brand";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: `Contact Us — ${brand.name}` },
      { name: "description", content: `Get in touch with the ${brand.name} demonstration platform team.` },
      { property: "og:title", content: `Contact Us — ${brand.name}` },
      { property: "og:description", content: `Get in touch with the ${brand.name} demonstration platform team.` },
      { property: "og:url", content: `${brand.website}/contact` },
    ],
    links: [{ rel: "canonical", href: `${brand.website}/contact` }],
  }),
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/" className="text-sm text-primary hover:underline">← Back to {brand.name}</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Contact Us</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {brand.name} is an independent demonstration platform. For questions, feedback or evaluation requests, reach us at the channels below.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Email</div>
            <a href={`mailto:${brand.supportEmail}`} className="font-bold text-primary hover:underline break-all">{brand.supportEmail}</a>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Helpline</div>
            <div className="font-bold">{brand.customerCare}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Mon–Sat, 9 AM – 7 PM IST</div>
          </div>

          <div className="rounded-xl border bg-card p-5 sm:col-span-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Website</div>
            <div className="font-bold">{brand.website}</div>
            <p className="text-[12px] text-muted-foreground mt-2">
              This platform is provided for demonstration, evaluation and development purposes only. It is not a banking institution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
