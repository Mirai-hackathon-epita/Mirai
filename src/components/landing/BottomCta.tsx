import * as React from "react";
import Link from "next/link";
import { C, FONT } from "@/lib/ui/theme";

// Closing call-to-action: a serif headline and the terracotta demo button.

export function BottomCta() {
  return (
    <section
      className="fade-up"
      style={{ padding: "56px 8px 24px", textAlign: "center" }}
    >
      <h2
        style={{
          fontFamily: FONT.serif,
          fontWeight: 500,
          fontSize: 38,
          letterSpacing: "-0.02em",
          margin: "0 0 20px",
        }}
      >
        Bring Mirai to your classroom.
      </h2>
      <Link
        href="/teacher"
        style={{
          background: C.terracotta,
          color: C.cream,
          borderRadius: 10,
          padding: "14px 30px",
          fontSize: 16,
          fontWeight: 500,
          fontFamily: FONT.sans,
          display: "inline-block",
        }}
      >
        Request a demo
      </Link>
    </section>
  );
}
