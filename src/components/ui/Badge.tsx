import { ReactNode } from "react";

export type BadgeVariant = "default" | "brand" | "accent" | "success" | "warning" | "error" | "info";
export type BadgeSize    = "sm" | "md";

interface BadgeProps {
  variant?:  BadgeVariant;
  size?:     BadgeSize;
  children:  ReactNode;
  className?: string;
}

const VARIANT: Record<BadgeVariant, string> = {
  default: "bg-surface-raised  text-fg-secondary  border-border",
  brand:   "bg-brand/10        text-brand-light   border-brand/25",
  accent:  "bg-accent/10       text-accent-light  border-accent/25",
  success: "bg-success/10      text-success-light border-success/25",
  warning: "bg-warning/10      text-warning-light border-warning/25",
  error:   "bg-error/10        text-error-light   border-error/25",
  info:    "bg-info/10         text-info-light    border-info/25",
};

const SIZE: Record<BadgeSize, string> = {
  sm: "text-[10px] px-2   py-0.5 rounded-xs tracking-widest",
  md: "text-[11px] px-2.5 py-1   rounded-sm  tracking-wider",
};

export default function Badge({
  variant   = "default",
  size      = "md",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center font-black uppercase border",
        VARIANT[variant],
        SIZE[size],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
