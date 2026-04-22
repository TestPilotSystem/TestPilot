import { InputHTMLAttributes, ReactNode, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  iconLeft,
  iconRight,
  className = "",
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? (label ? generatedId : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-black text-fg-muted uppercase tracking-widest"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {iconLeft && (
          <span className="absolute left-3.5 text-fg-muted pointer-events-none flex items-center">
            {iconLeft}
          </span>
        )}

        <input
          id={inputId}
          className={[
            "w-full bg-surface-raised text-fg-primary text-sm font-medium",
            "placeholder:text-fg-muted",
            "border rounded-lg px-4 py-3",
            "outline-none transition-all duration-[120ms]",
            "focus:ring-2 focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-error/50 focus:ring-error/35"
              : "border-border-strong focus:ring-brand/40 hover:border-border-strong/70",
            iconLeft  ? "pl-10"  : "",
            iconRight ? "pr-10"  : "",
            className,
          ].join(" ")}
          {...props}
        />

        {iconRight && (
          <span className="absolute right-3.5 text-fg-muted flex items-center">
            {iconRight}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-error-light font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-fg-muted">{hint}</p>
      )}
    </div>
  );
}
