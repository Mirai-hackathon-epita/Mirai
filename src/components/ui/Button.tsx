"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";

type Variant = "primary" | "secondary" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  size?: "sm" | "md" | "lg";
}

const PAD: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "9px 16px",
  md: "12px 22px",
  lg: "14px 26px",
};

export function Button({
  variant = "primary",
  block,
  size = "md",
  style,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const base: React.CSSProperties = {
    fontFamily: FONT.sans,
    fontSize: size === "lg" ? 16 : 15,
    fontWeight: 500,
    borderRadius: 10,
    padding: PAD[size],
    border: "1px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: block ? "100%" : undefined,
    transition: "filter 0.15s ease, opacity 0.15s ease, background 0.15s ease",
    opacity: disabled ? 0.55 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  };
  const variants: Record<Variant, React.CSSProperties> = {
    primary: { background: C.terracotta, color: C.cream },
    secondary: {
      background: C.paper2,
      color: C.muted,
      borderColor: "rgba(22,26,34,0.14)",
    },
    ghost: { background: "transparent", color: C.muted },
  };
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.filter = "brightness(0.96)";
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "none";
        rest.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}
