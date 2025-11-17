import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const numericId = Number(id);
  if (isNaN(numericId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json();

  const data: any = {};
    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.status !== undefined) data.status = body.status;
    if (body.description !== undefined)
    data.description = body.description ? String(body.description).trim() : null;
    if (body.deadline !== undefined) {
      data.deadline = body.deadline ? new Date(body.deadline) : null;
    }

  try {
    const updated = await prisma.task.update({
      where: { id: numericId },
      data,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}


export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const numericId = Number(id);
  if (isNaN(numericId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await prisma.task.update({
      where: { id: numericId },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
