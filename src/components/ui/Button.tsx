"use client";

import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
export type ButtonSize    = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-brand hover:bg-brand-light active:bg-brand-dark text-white shadow-sm hover:shadow-brand disabled:bg-brand/40 disabled:shadow-none",
  secondary:
    "bg-surface-raised hover:bg-surface-overlay active:bg-surface text-fg-primary border border-border-strong hover:border-border disabled:opacity-50",
  ghost:
    "bg-transparent hover:bg-surface-raised active:bg-surface-overlay text-fg-secondary hover:text-fg-primary disabled:opacity-40",
  danger:
    "bg-error hover:bg-error-light active:bg-error/80 text-white shadow-sm disabled:bg-error/40 disabled:shadow-none",
  accent:
    "bg-accent hover:bg-accent-light active:bg-accent-dark text-white shadow-sm hover:shadow-accent disabled:bg-accent/40 disabled:shadow-none",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-8  px-3.5 text-xs  rounded-md  gap-1.5",
  md: "h-10 px-5   text-sm  rounded-lg  gap-2",
  lg: "h-12 px-7   text-base rounded-xl gap-2.5",
};

const ICON_SIZE: Record<ButtonSize, number> = { sm: 13, md: 15, lg: 17 };

export default function Button({
  variant  = "primary",
  size     = "md",
  loading  = false,
  iconLeft,
  iconRight,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const iconSz = ICON_SIZE[size];

  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center font-semibold cursor-pointer select-none",
        "transition-all duration-[120ms] active:scale-[0.97]",
        "disabled:cursor-not-allowed disabled:active:scale-100",
        VARIANT[variant],
        SIZE[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <Loader2 size={iconSz} className="animate-spin shrink-0" />
      ) : iconLeft ? (
        <span className="shrink-0">{iconLeft}</span>
      ) : null}

      {children}

      {!loading && iconRight && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </button>
  );
}
