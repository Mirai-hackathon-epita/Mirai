export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  saveDeadline,
  getActivity,
  getStudents,
} from "@/lib/data/repo";
import { kv } from "@/lib/store/kv";
import { genId } from "@/lib/llm/client";
import type { ActivityItem, MasteryDeadline } from "@/lib/domain/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { topic?: string; date?: string };
    const topic = body.topic?.trim() ?? "";
    const date = body.date?.trim() ?? "";

    if (!topic || !date) {
      return NextResponse.json(
        { error: "topic and date are required" },
        { status: 400 },
      );
    }

    // Basic ISO date validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "date must be ISO format YYYY-MM-DD" },
        { status: 400 },
      );
    }

    const deadline: MasteryDeadline = {
      topic,
      date,
      setAt: Date.now(),
    };

    await saveDeadline(deadline);

    // Push a class activity item noting the deadline was set.
    const students = await getStudents();
    const activity = await getActivity();
    const newItem: ActivityItem = {
      id: genId("act"),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      text: `**Deadline set:** ${topic} by ${date} — Mirai re-paced **${students.length}** students`,
    };
    activity.unshift(newItem);
    // Keep activity list bounded to 50 items.
    const trimmed = activity.slice(0, 50);
    await kv().setJSON("mira:activity", trimmed);

    return NextResponse.json({ deadline });
  } catch (err) {
    console.error("[teacher/deadline]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
