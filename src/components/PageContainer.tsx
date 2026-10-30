import React from "react";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard Institutional PageContainer for SBS CaseLab
 * Shared layout container enforcing identical left/right margins and responsive padding:
 * - Mobile (<640px): 16px (px-4)
 * - Tablet (640px–1023px): 24px (sm:px-6)
 * - Desktop (1024px–1535px): 32px (lg:px-8), max-w-[1440px]
 * - Ultra-wide (1536px+ / 1600px+): 40px (2xl:px-10), max-w-[1536px]
 */
export function PageContainer({
  children,
  className = "",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={`w-full max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
