import { NextRequest, NextResponse } from "next/server";
import {
  getInstancesForDate,
  toggleInstanceCompletion,
  snoozeInstanceToTomorrow,
  updateInstanceActualMinutes,
  reviveAbandonedInstance,
} from "@/lib/task-service";
import { getTodayDateString } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dateStr = searchParams.get("date") || getTodayDateString();

    const instances = await getInstancesForDate(dateStr);
    return NextResponse.json({ date: dateStr, instances });
  } catch (err: any) {
    console.error("Instances GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch task instances", details: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { instanceId, action, minutes, targetDate } = body;

    if (!instanceId || !action) {
      return NextResponse.json(
        { error: "instanceId and action are required" },
        { status: 400 }
      );
    }

    if (action === "toggle") {
      const updated = await toggleInstanceCompletion(instanceId);
      return NextResponse.json({ success: true, instance: updated });
    }

    if (action === "snooze") {
      const result = await snoozeInstanceToTomorrow(instanceId);
      return NextResponse.json({
        success: true,
        message: "Task snoozed to tomorrow",
        original: result.original,
        tomorrow: result.tomorrow,
      });
    }

    if (action === "log_time") {
      if (typeof minutes !== "number") {
        return NextResponse.json(
          { error: "Valid minutes number is required" },
          { status: 400 }
        );
      }
      const updated = await updateInstanceActualMinutes(instanceId, minutes);
      return NextResponse.json({ success: true, instance: updated });
    }

    if (action === "revive") {
      const revived = await reviveAbandonedInstance(instanceId, targetDate);
      return NextResponse.json({
        success: true,
        message: "Task revived to target date",
        instance: revived,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Instances PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to update instance", details: err.message },
      { status: 500 }
    );
  }
}
