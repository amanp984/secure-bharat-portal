export const brand = {
  name: "Indian Bank One",
  tagline: "Secure Digital Banking",
  supportEmail: "support@indianbankone.in",
  customerCare: "1800-572-9900",
  branch: "Anna Nagar Main Branch",
  website: "https://www.indianbankone.in",
  appInstallPath: "https://www.indianbankone.in/app",
  description:
    "Indian Bank One net banking portal for secure statements, transfers, cards, deposits, bill payments and service requests.",
} as const;

export const brandMeta = {
  title: `${brand.name} — ${brand.tagline}`,
  description: brand.description,
} as const;