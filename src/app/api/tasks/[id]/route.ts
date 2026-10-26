import { NextRequest, NextResponse } from "next/server";
import { query, initDatabase } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initDatabase();
    const taskId = parseInt(params.id, 10);
    const body = await req.json();

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      "title",
      "category",
      "priority",
      "is_recurring",
      "recurrence_rule",
      "default_duration_minutes",
      "notes",
      "active",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(field === "is_recurring" || field === "active" ? Boolean(body[field]) : body[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: "No updates provided" });
    }

    values.push(taskId);
    const sql = `UPDATE tasks SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    const res = await query(sql, values);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update task", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initDatabase();
    const taskId = parseInt(params.id, 10);

    // Soft delete by setting active = false
    await query(`UPDATE tasks SET active = false WHERE id = $1`, [taskId]);
    return NextResponse.json({ success: true, message: "Task archived" });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to delete task", details: err.message },
      { status: 500 }
    );
  }
}
