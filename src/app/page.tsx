import * as React from "react";
import Link from "next/link";
import { C, FONT } from "@/lib/ui/theme";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { BottomCta } from "@/components/landing/BottomCta";

// Screen 01 — Landing page. Rendered as a real, responsive full-width page
// (no browser-chrome mock), centred at max-width ~1200px on a warm paper bg.

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.ink,
        fontFamily: FONT.sans,
        padding: "32px 0 96px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Nav />

        <Hero />

        <FeatureGrid />

        <BottomCta />

        {/* Direct path into the product for a judge / quick demo. */}
        <div
          className="fade-up"
          style={{ textAlign: "center", paddingBottom: 8 }}
        >
          <Link
            href="/teacher"
            style={{
              fontFamily: FONT.mono,
              fontSize: 13,
              letterSpacing: "0.04em",
              color: C.mono,
              borderBottom: `1px solid ${C.line2}`,
              paddingBottom: 2,
              transition: "color 0.15s ease",
            }}
          >
            Open the demo →
          </Link>
        </div>
      </div>

      {/* Responsive stacking — desktop is the demo target, but degrade
          gracefully on narrower viewports without a CSS framework. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 900px) {
              .mira-hero { grid-template-columns: 1fr !important; gap: 32px !important; }
              .mira-feature-grid { grid-template-columns: repeat(2, 1fr) !important; row-gap: 32px !important; }
              .mira-nav-links { display: none !important; }
            }
            @media (max-width: 560px) {
              .mira-feature-grid { grid-template-columns: 1fr !important; }
            }
          `,
        }}
      />
    </main>
  );
}
