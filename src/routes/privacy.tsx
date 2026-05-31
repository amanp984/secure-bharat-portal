import { createFileRoute, Link } from "@tanstack/react-router";
import { brand } from "@/lib/brand";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${brand.name}` },
      { name: "description", content: `How ${brand.name} handles information on its demonstration platform.` },
      { property: "og:title", content: `Privacy Policy — ${brand.name}` },
      { property: "og:description", content: `How ${brand.name} handles information on its demonstration platform.` },
      { property: "og:url", content: `${brand.website}/privacy` },
    ],
    links: [{ rel: "canonical", href: `${brand.website}/privacy` }],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/" className="text-sm text-primary hover:underline">← Back to {brand.name}</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-5 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="font-bold text-lg mb-1">1. Scope</h2>
            <p>{brand.name} is a demonstration and evaluation platform. It is not a bank and does not operate financial services. This Privacy Policy explains how the platform handles information you interact with during a demonstration session.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">2. Information We Process</h2>
            <p>The platform may temporarily process credentials you enter on the login screen for session management. Account data, transactions and customer details displayed inside the platform are simulated and used only to illustrate UI behaviour.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">3. Local Storage</h2>
            <p>A small flag may be stored in your browser's local storage to keep you signed in during a session. No personal financial information is transmitted to any third party.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">4. Cookies &amp; Analytics</h2>
            <p>The platform may use anonymous analytics to understand usage patterns for the purpose of improving the demonstration. No personally identifiable information is sold or shared.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">5. Security</h2>
            <p>While the platform follows industry best practices for client-side security, it is provided for demonstration only. Do not use real banking credentials, real OTPs, real card numbers or any sensitive personal information.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">6. Changes</h2>
            <p>This policy may be updated at any time. Continued use of {brand.name} after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">7. Contact</h2>
            <p>Privacy questions can be sent to <a className="text-primary hover:underline" href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
