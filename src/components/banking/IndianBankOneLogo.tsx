import { cn } from "@/lib/utils";

// Centralised wordmark for the Indian One platform. Renders as an inline SVG
// so the same component slot can be replaced later with an uploaded asset
// without changing layout or sizing anywhere it's used.
export function IndianBankOneLogo({
  className,
  alt = "Indian One",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={alt}
      className={cn("object-contain", className)}
    >
      <defs>
        <linearGradient id="io-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#io-logo-grad)" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="26"
        fontWeight="700"
        fill="#ffffff"
        letterSpacing="-1"
      >
        IO
      </text>
    </svg>
  );
}

// Re-exported alias for any modules that still imported the named asset path.
export const indianBankOneLogoSrc = "";
