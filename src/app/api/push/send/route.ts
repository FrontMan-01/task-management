import { NextRequest, NextResponse } from "next/server";
import { sendNotificationToAll } from "@/lib/push";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title = "⚡ DO OR DIE", body: msgBody = "Test notification", url = "/" } = body;

    const results = await sendNotificationToAll({
      title,
      body: msgBody,
      url,
    });

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to send notification", details: err.message },
      { status: 500 }
    );
  }
}
