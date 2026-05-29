import logo from "@/assets/indian-bank-one-logo.png";
import { cn } from "@/lib/utils";

export const indianBankOneLogoSrc = logo;

export function IndianBankOneLogo({
  className,
  alt = "Indian Bank One",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={logo}
      alt={alt}
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}
