import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status"); 
    const where: any = { deleted_at: null };
    if (status === "completed") where.completed = true;
    if (status === "active") where.completed = false;

    const tasks = await prisma.task.findMany({
      where: {
        deleted_at: null, 
      },
      orderBy: {
        createdAt: 'desc', 
      },
    });
    return NextResponse.json(tasks);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() ?? null,
        deadline: body.deadline ? new Date(body.deadline) : null
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("POST Error:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
