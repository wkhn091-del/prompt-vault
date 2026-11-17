import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

/** Motionsites-style M mark — used in header, watermarks, and favicon. */
export function BrandLogo({
  size = 32,
  className = "",
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/logo-m.svg"
      alt="Prompt Vault"
      width={size}
      height={size}
      priority={priority}
      className={`shrink-0 ${className}`}
    />
  );
}
