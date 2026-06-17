export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { resolveCallRequest } from "@/lib/data/repo";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    await resolveCallRequest(id);
    return NextResponse.json({ resolved: true });
  } catch (err) {
    console.error("[teacher/call/resolve]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
