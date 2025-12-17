import { NextResponse } from "next/server";
import { ListService } from "@/services/list-service";

const listService = new ListService();

export async function GET() {
  try {
    const lists = await listService.getLists();
    return NextResponse.json(lists);
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color, emoji, isMagic = false } = body;

    if (!name || !color || !emoji) {
      return NextResponse.json(
        { error: "Name, color, and emoji are required" },
        { status: 400 }
      );
    }

    const newList = await listService.createList({
      name,
      color,
      emoji,
      isMagic,
    });

    return NextResponse.json(newList, { status: 201 });
  } catch (error) {
    console.error("Error creating list:", error);
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
