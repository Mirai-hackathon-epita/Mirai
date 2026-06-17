export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  getTeacher,
  getStudents,
  getClassStats,
  getActivity,
  getTopicMastery,
  getInsight,
} from "@/lib/data/repo";
import { formatServerTime } from "@/lib/ui/format";
import type { DashboardResponse, FlagInfo, Student } from "@/lib/domain/types";

export async function GET() {
  try {
    const [teacher, students, classStats, activity, topicMastery, insight] =
      await Promise.all([
        getTeacher(),
        getStudents(),
        getClassStats(),
        getActivity(),
        getTopicMastery(),
        getInsight(),
      ]);

    const flagged = students.filter(
      (s): s is Student & { flag: FlagInfo } => s.flag != null,
    );

    const resp: DashboardResponse = {
      teacher,
      classStats,
      flagged,
      roster: students,
      activity,
      topicMastery,
      insight,
      serverTime: formatServerTime(),
    };

    return NextResponse.json(resp);
  } catch (err) {
    console.error("[dashboard]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
