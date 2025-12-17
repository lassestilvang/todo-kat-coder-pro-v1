import { NextResponse } from "next/server";
import { SearchService } from "@/services/search-service";

const searchService = new SearchService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") as
      | "all"
      | "tasks"
      | "labels"
      | "lists"
      | undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    if (type === "tasks") {
      const tasks = await searchService.searchTasks(query, {
        limit,
        offset,
      });
      return NextResponse.json(tasks);
    } else if (type === "labels") {
      const labels = await searchService.searchLabels(query);
      return NextResponse.json(labels);
    } else if (type === "lists") {
      const lists = await searchService.searchLists(query);
      return NextResponse.json(lists);
    } else {
      const results = await searchService.searchAll(query, {
        limit,
        offset,
      });
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error("Error performing search:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
