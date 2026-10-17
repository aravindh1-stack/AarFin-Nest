import React from "react";

export interface BrandLogoProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  className?: string;
  alt?: string;
  variant?: "auto" | "light" | "dark";
}

/**
 * BrandLogo renders the NexFix brand logo.
 * - In light theme (or when variant="light"): uses `/nexfix.png`
 * - In dark theme (or when variant="dark"): uses `/nexfix-white.png`
 * - In "auto" mode: toggles seamlessly via CSS without hydration flash.
 */
export function BrandLogo({
  className = "h-8 w-auto object-contain",
  alt = "NexFix Logo",
  variant = "auto",
  ...props
}: BrandLogoProps) {
  if (variant === "dark") {
    return (
      <img
        src="/nexfix-white.png"
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  if (variant === "light") {
    return (
      <img
        src="/nexfix.png"
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  return (
    <>
      {/* Light theme logo */}
      <img
        src="/nexfix.png"
        alt={alt}
        className={`block dark:hidden ${className}`}
        {...props}
      />
      {/* Dark theme logo */}
      <img
        src="/nexfix-white.png"
        alt={alt}
        className={`hidden dark:block ${className}`}
        {...props}
      />
    </>
  );
}

export default BrandLogo;
