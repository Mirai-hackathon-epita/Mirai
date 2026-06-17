export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { saveMastery, saveStudent, getStudent } from "@/lib/data/repo";
import { MASTERY, FEED, STUDENTS } from "@/lib/seed/data";
import { kv } from "@/lib/store/kv";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  const student = await getStudent(id);
  if (!student) {
    return NextResponse.json({ error: "student not found" }, { status: 404 });
  }

  // Reset mastery to seed values
  const seedMastery = MASTERY[id] ?? [];
  await saveMastery(id, seedMastery);

  // Reset overall mastery on student record
  const seedStudent = STUDENTS.find((s) => s.id === id);
  if (seedStudent) {
    await saveStudent({ ...student, overallMastery: seedStudent.overallMastery, flagged: seedStudent.flagged });
  }

  // Reset feed
  const store = kv();
  const feedKey = `mira:feed:${id}`;
  await store.del(feedKey);
  const events = FEED[id] ?? [];
  for (const ev of events) await store.listUnshift(feedKey, ev);

  return NextResponse.json({ ok: true });
}
