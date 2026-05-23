import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { accounts } from "@/lib/banking-data";

const BASE_URL = "https://digital-dhan-portal-new.lovable.app";

const staticPaths = [
  "/",
  "/accounts",
  "/fund-transfer",
  "/fund-transfer/otp",
  "/beneficiary",
  "/bills",
  "/cards",
  "/deposits",
  "/loans",
  "/investments",
  "/settings",
  "/support",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const dynamicPaths = accounts.flatMap((a) => [
          `/accounts/${a.id}`,
          `/accounts/${a.id}/passbook`,
          `/accounts/${a.id}/statement`,
        ]);
        const paths = [...staticPaths, ...dynamicPaths];
        const urls = paths
          .map(
            (p) =>
              `  <url>\n    <loc>${BASE_URL}${p}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${p === "/" ? "1.0" : "0.7"}</priority>\n  </url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
