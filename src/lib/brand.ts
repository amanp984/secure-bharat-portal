export const brand = {
  name: "Indian One",
  tagline: "Secure Digital Platform",
  supportEmail: "support@indianone.in",
  customerCare: "1800-572-9900",
  branch: "Mumbai",
  website: "https://www.indianone.in",
  appInstallPath: "https://www.indianone.in/app",
  description:
    "Indian One is an independent demonstration and evaluation platform for digital account workflows, transfers, statements and service requests.",
} as const;

export const brandMeta = {
  title: `${brand.name} — ${brand.tagline}`,
  description: brand.description,
} as const;
