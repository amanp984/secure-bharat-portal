import { createFileRoute, Link } from "@tanstack/react-router";
import { brand } from "@/lib/brand";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: `Terms & Conditions — ${brand.name}` },
      { name: "description", content: `Terms and conditions governing the use of the ${brand.name} demonstration platform.` },
      { property: "og:title", content: `Terms & Conditions — ${brand.name}` },
      { property: "og:description", content: `Terms and conditions governing the use of the ${brand.name} demonstration platform.` },
      { property: "og:url", content: `${brand.website}/terms` },
    ],
    links: [{ rel: "canonical", href: `${brand.website}/terms` }],
  }),
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/" className="text-sm text-primary hover:underline">← Back to {brand.name}</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-5 text-sm leading-relaxed text-foreground">
          <section className="rounded-lg border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 p-4">
            <h2 className="font-bold text-amber-900 dark:text-amber-200 mb-1">Important Notice</h2>
            <p className="text-amber-900 dark:text-amber-200">
              This platform is a testing environment intended for demonstration, evaluation and development purposes. It is not a banking institution and does not represent, operate or provide banking services.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">1. Acceptance of Terms</h2>
            <p>By accessing or using {brand.name}, you acknowledge that you have read, understood and agree to be bound by these Terms &amp; Conditions. If you do not agree, please discontinue use of the platform.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">2. Nature of the Platform</h2>
            <p>{brand.name} is an independent software platform created for demonstration and evaluation. It does not hold, transmit or process real funds. Any account numbers, balances, statements, transfers, cards or transactions visible on the platform are simulated for illustrative purposes only.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">3. No Banking Services</h2>
            <p>{brand.name} is not affiliated with any bank, financial institution, regulator or government body. No real money movement, deposit, lending or payment processing occurs through the platform.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">4. User Conduct</h2>
            <p>You agree not to use the platform for any unlawful purpose, to impersonate any real person or entity, or to attempt to interfere with the platform's normal operation.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">5. Intellectual Property</h2>
            <p>All design, code, content and branding presented on {brand.name} are the property of the platform's authors. No real-world trademarks are claimed.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">6. Limitation of Liability</h2>
            <p>The platform is provided “as is” without warranties of any kind. The authors are not liable for any decisions made on the basis of information or data shown on the platform.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">7. Contact</h2>
            <p>For questions regarding these terms, write to <a className="text-primary hover:underline" href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
