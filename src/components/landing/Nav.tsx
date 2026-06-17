import * as React from "react";
import Link from "next/link";
import { C, FONT } from "@/lib/ui/theme";
import { Logo } from "@/components/ui";

// Top navigation for the landing page.
// "For students" → /student, "For teachers" / "Sign in" / "Request a demo" → /teacher.

const NAV_LINK: React.CSSProperties = {
  fontSize: 15,
  color: C.muted,
  transition: "color 0.15s ease",
};

export function Nav() {
  return (
    <nav
      className="mira-nav fade-up"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "26px 8px",
        gap: 24,
      }}
    >
      <Link href="/" aria-label="Mira home" style={{ flex: "none" }}>
        <Logo size={26} />
      </Link>

      <div
        className="mira-nav-links"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
        }}
      >
        <span style={NAV_LINK}>Product</span>
        <Link href="/teacher" style={NAV_LINK}>
          For teachers
        </Link>
        <Link href="/student" style={NAV_LINK}>
          For students
        </Link>
        <span style={NAV_LINK}>Pricing</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18, flex: "none" }}>
        <Link href="/teacher" style={NAV_LINK}>
          Sign in
        </Link>
        <Link
          href="/teacher"
          style={{
            background: C.terracotta,
            color: C.cream,
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 15,
            fontWeight: 500,
            fontFamily: FONT.sans,
          }}
        >
          Request a demo
        </Link>
      </div>
    </nav>
  );
}
