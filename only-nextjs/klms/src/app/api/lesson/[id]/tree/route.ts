import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/lesson/[id]/tree
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  const database = dbClient.db("lessonsData");
  const lessonsCollection = database.collection("lessons");

  if (!id) {
    return NextResponse.json({
      success: false,
      error: "Lesson ID is required",
    });
  }

  const lesson = await lessonsCollection.findOne({ id: id });

  if (!lesson) {
    return NextResponse.json({ success: false, error: "Lesson not found" });
  }

  type HierarchyNode = {
    id: string;
    name: string;
    children: HierarchyNode[] | null;
  } | null;

  async function buildHierarchy(
    lessonId: string,
    visited: Set<string> = new Set()
  ): Promise<HierarchyNode> {
    console.log(lessonId);
    if (visited.has(lessonId)) return null; // Prevent circular references
    visited.add(lessonId);

    const currentLesson = await lessonsCollection.findOne({ id: lessonId });
    if (!currentLesson) return null;

    const parentHierarchy =
      currentLesson.parentId && !visited.has(currentLesson.parentId)
        ? await buildHierarchy(currentLesson.parentId, visited)
        : null;

    const children = await lessonsCollection.find({ parentId: lessonId }).toArray();
    const childHierarchy = await Promise.all(
      children.map(async (child: any) => await buildHierarchy(child.id, new Set(visited)))
    );

    const filteredChildren = childHierarchy.filter((node): node is NonNullable<HierarchyNode> => node !== null);

    const currentNode = {
      id: currentLesson.id,
      name: currentLesson.name,
      children: filteredChildren.length > 0 ? filteredChildren : null,
    };

    return parentHierarchy
      ? { ...parentHierarchy, children: [currentNode] }
      : currentNode;
  }

  const hierarchy = await buildHierarchy(id);

  // TODO: Implement lesson tree logic
  return NextResponse.json({ success: true, tree: hierarchy });
}
