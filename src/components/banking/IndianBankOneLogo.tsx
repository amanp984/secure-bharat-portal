import { cn } from "@/lib/utils";
import logoSrc from "@/assets/indian-one-logo.png";

// Centralised wordmark for the Indian One platform. Renders the uploaded
// brand logo so every header, sidebar, loading overlay, and PDF stays
// visually consistent.
export function IndianOneLogo({
  className,
  alt = "Indian One",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={logoSrc}
      alt={alt}
      className={cn("object-contain w-full h-full", className)}
    />
  );
}

export const indianBankOneLogoSrc = logoSrc;
