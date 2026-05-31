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
          <section>
            <h2 className="font-bold text-lg mb-1">Welcome to Indian One.</h2>
            <p>Indian One is an independent digital platform intended solely for software testing, interface evaluation, demonstration, training, development and system validation purposes.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-1">Acknowledgement</h2>
            <p>By using this platform, you acknowledge and agree that:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Indian One is not a bank.</li>
              <li>Indian One is not a financial institution.</li>
              <li>Indian One does not provide banking services.</li>
              <li>Indian One does not provide payment services.</li>
              <li>Indian One does not represent any government authority.</li>
              <li>Indian One does not represent any existing banking organization.</li>
              <li>The platform is provided for testing, development and demonstration purposes only.</li>
              <li>Users are responsible for their own activities while using the platform.</li>
              <li>The platform may be modified, updated, suspended or discontinued at any time without notice.</li>
              <li>Users should not rely on the platform for financial, legal or commercial decisions.</li>
              <li>All trademarks, logos and intellectual property remain the property of their respective owners.</li>
              <li>Unauthorized misuse of the platform is prohibited.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
