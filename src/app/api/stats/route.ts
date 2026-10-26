import { NextResponse } from "next/server";
import { getStatsSummary } from "@/lib/task-service";

export async function GET() {
  try {
    const stats = await getStatsSummary();
    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch stats", details: err.message },
      { status: 500 }
    );
  }
}
