import { NextResponse } from "next/server";
import { getBacklogTasks } from "@/lib/task-service";

export async function GET() {
  try {
    const data = await getBacklogTasks();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch backlog", details: err.message },
      { status: 500 }
    );
  }
}
