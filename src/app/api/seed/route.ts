import { NextResponse } from "next/server";
import { runSeeder } from "@/lib/task-service";

export async function POST() {
  try {
    const result = await runSeeder();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Seed error:", err);
    return NextResponse.json(
      { error: "Failed to run seeder", details: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Convenience for manual trigger via browser
  return POST();
}
