export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  getTeacher,
  getActivity,
  getActiveCourse,
  getDeadline,
  getCallRequests,
} from "@/lib/data/repo";
import { getClassInsight, getClassSnapshot } from "@/lib/agent/classSnapshot";
import { formatServerTime } from "@/lib/ui/format";
import type { DashboardResponse, FlagInfo, Student } from "@/lib/domain/types";

export async function GET() {
  try {
    // classStats / topicMastery / insight are derived from the fleet's live
    // mastery, not from seeded constants — the dashboard has to move when a
    // student actually works, otherwise it is reporting fiction.
    const [snapshot, teacher, activity, activeCourse, deadline, callRequests] =
      await Promise.all([
        getClassSnapshot(),
        getTeacher(),
        getActivity(),
        getActiveCourse(),
        getDeadline(),
        getCallRequests(),
      ]);

    const insight = await getClassInsight(snapshot);

    const flagged = snapshot.students.filter(
      (s): s is Student & { flag: FlagInfo } => s.flag != null,
    );

    const resp: DashboardResponse = {
      teacher,
      classStats: snapshot.classStats,
      flagged,
      roster: snapshot.students,
      activity,
      topicMastery: snapshot.topicMastery,
      insight,
      serverTime: formatServerTime(),
      callRequests: callRequests.filter((r) => r.status === "open"),
      deadline,
      activeCourse,
    };

    return NextResponse.json(resp);
  } catch (err) {
    console.error("[dashboard]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
