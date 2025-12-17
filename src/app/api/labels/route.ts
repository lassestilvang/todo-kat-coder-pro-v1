import { NextResponse } from "next/server";
import { LabelService } from "@/services/label-service";

const labelService = new LabelService();

export async function GET() {
  try {
    const labels = await labelService.getLabels();
    return NextResponse.json(labels);
  } catch (error) {
    console.error("Error fetching labels:", error);
    return NextResponse.json(
      { error: "Failed to fetch labels" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, icon, color } = body;

    if (!name || !icon || !color) {
      return NextResponse.json(
        { error: "Name, icon, and color are required" },
        { status: 400 }
      );
    }

    const newLabel = await labelService.createLabel({
      name,
      icon,
      color,
    });

    return NextResponse.json(newLabel, { status: 201 });
  } catch (error) {
    console.error("Error creating label:", error);
    return NextResponse.json(
      { error: "Failed to create label" },
      { status: 500 }
    );
  }
}
