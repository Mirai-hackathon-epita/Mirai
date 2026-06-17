export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getFeed } from "@/lib/data/repo";
import { FEED } from "@/lib/seed/data";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    let feed = await getFeed(id);

    // If empty, fall back to seed data (should not happen after seeding, but
    // this is defensive for a new student id used in demos)
    if (feed.length === 0) {
      feed = FEED[id] ?? [];
    }

    return NextResponse.json({ feed });
  } catch (err) {
    console.error("[students/feed]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
