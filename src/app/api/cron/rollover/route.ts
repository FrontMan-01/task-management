import { NextRequest, NextResponse } from "next/server";
import { executeMidnightRollover } from "@/lib/task-service";

export async function GET(req: NextRequest) {
  return handleRollover(req);
}

export async function POST(req: NextRequest) {
  return handleRollover(req);
}

async function handleRollover(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const todayParam = req.nextUrl.searchParams.get("date") || undefined;
    const result = await executeMidnightRollover(todayParam);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: any) {
    console.error("Rollover cron error:", err);
    return NextResponse.json(
      { error: "Failed to execute midnight rollover", details: err.message },
      { status: 500 }
    );
  }
}
