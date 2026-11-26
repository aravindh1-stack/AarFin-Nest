import React from "react";
import Image from "next/image";

export interface BrandLogoProps {
  className?: string;
  alt?: string;
  variant?: "auto" | "light" | "dark";
  priority?: boolean;
}

/**
 * BrandLogo renders the AarFin Nest brand logo.
 * - In light theme (or when variant="light"): uses `/nexfix.png`
 * - In dark theme (or when variant="dark"): uses `/nexfix-white.png`
 * - In "auto" mode: toggles seamlessly via CSS without hydration flash.
 */
export function BrandLogo({
  className = "h-8 w-auto object-contain",
  alt = "NexFix Logo",
  variant = "auto",
  priority = false,
}: BrandLogoProps) {
  if (variant === "dark") {
    return (
      <Image
        src="/nexfix-white.png"
        alt={alt}
        width={120}
        height={32}
        priority={priority}
        className={className}
      />
    );
  }

  if (variant === "light") {
    return (
      <Image
        src="/nexfix.png"
        alt={alt}
        width={120}
        height={32}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <>
      {/* Light theme logo */}
      <Image
        src="/nexfix.png"
        alt={alt}
        width={120}
        height={32}
        priority={priority}
        className={`block dark:hidden ${className}`}
      />
      {/* Dark theme logo */}
      <Image
        src="/nexfix-white.png"
        alt={alt}
        width={120}
        height={32}
        priority={priority}
        className={`hidden dark:block ${className}`}
      />
    </>
  );
}

export default BrandLogo;
