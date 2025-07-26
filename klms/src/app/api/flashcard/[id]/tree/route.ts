import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/lesson/[id]/tree
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const database = dbClient.db("flashcardsData");
  const flashcardsCollection = database.collection("flashcards");

  const lessonsDb = dbClient.db("lessonsData");
  const lessonsCollection = lessonsDb.collection("lessons");

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        error: "Flashcard ID is required",
      },
      { status: 400 }
    );
  }

  const flashcardSet = await flashcardsCollection.findOne({ id: id });

  if (!flashcardSet) {
    return NextResponse.json(
      {
        success: false,
        error: "Flashcard not found",
      },
      { status: 404 }
    );
  }

  if (!flashcardSet.parentId) {
    return NextResponse.json({
      success: true,
      flashcardSet: flashcardSet,
    });
  }

  type HierarchyNode = {
    id: string;
    type: "flashcard" | "lesson";
    title: string;
    children: HierarchyNode[] | null;
  } | null;

  async function buildHierarchy(
    nodeId: string,
    nodeType: "flashcard" | "lesson",
    visited: Set<string> = new Set()
  ): Promise<HierarchyNode> {
    const uniqueKey = `${nodeType}:${nodeId}`;
    if (visited.has(uniqueKey)) return null; // Prevent circular references
    visited.add(uniqueKey);

    if (nodeType === "flashcard") {
      const flashcardNode = await flashcardsCollection.findOne({ id: nodeId });
      if (!flashcardNode) return null;

      // Flashcards can't have children, but can have a parent lesson
      let parentHierarchy: HierarchyNode | null = null;
      if (flashcardNode.parentId) {
        parentHierarchy = await buildHierarchy(flashcardNode.parentId, "lesson", visited);
      }

      const currentNode: HierarchyNode = {
        id: flashcardNode.id,
        type: "flashcard",
        title: flashcardNode.name,
        children: null,
      };

      return parentHierarchy
        ? { ...parentHierarchy, children: [currentNode] }
        : currentNode;
    } else {
      const lessonNode = await lessonsCollection.findOne({ id: nodeId });
      if (!lessonNode) return null;

      // Find children flashcards and lessons
      const children: HierarchyNode[] = [];
      if (Array.isArray(lessonNode.children)) {
        for (const child of lessonNode.children) {
          if (child.type === "flashcard" && child.id) {
            const flashcardChild = await buildHierarchy(child.id, "flashcard", new Set(visited));
            if (flashcardChild) children.push(flashcardChild);
          }
          if (child.type === "lesson" && child.id) {
            const lessonChild = await buildHierarchy(child.id, "lesson", new Set(visited));
            if (lessonChild) children.push(lessonChild);
          }
        }
      }

      const currentNode: HierarchyNode = {
        id: lessonNode.id,
        type: "lesson",
        title: lessonNode.name || lessonNode.title || "",
        children: children.length > 0 ? children : null,
      };

      // Recursively build parent hierarchy if exists
      let parentHierarchy: HierarchyNode | null = null;
      if (lessonNode.parentId) {
        parentHierarchy = await buildHierarchy(lessonNode.parentId, "lesson", visited);
      }

      return parentHierarchy
        ? { ...parentHierarchy, children: [currentNode] }
        : currentNode;
    }
  }

  const hierarchy = await buildHierarchy(flashcardSet.id, "flashcard");

  if (!hierarchy) {
    return NextResponse.json(
      {
        success: false,
        error: "Hierarchy could not be built",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    tree: hierarchy,
  });
}
