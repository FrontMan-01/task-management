import { NextRequest, NextResponse } from "next/server";
import { query, initDatabase } from "@/lib/db";
import { getTodayDateString } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    await initDatabase();
    const date = req.nextUrl.searchParams.get("date") || getTodayDateString();

    const res = await query(`SELECT * FROM daily_notes WHERE date = $1`, [date]);
    return NextResponse.json({
      date,
      content: res.rows[0]?.content || "",
      updated_at: res.rows[0]?.updated_at || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch note", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    const body = await req.json();
    const { date = getTodayDateString(), content = "" } = body;

    const res = await query(
      `INSERT INTO daily_notes (date, content, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (date) DO UPDATE SET content = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [date, content]
    );

    return NextResponse.json({ success: true, note: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to save note", details: err.message },
      { status: 500 }
    );
  }
}
