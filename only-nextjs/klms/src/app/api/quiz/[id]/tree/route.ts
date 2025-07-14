import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/quiz/[id]/tree
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    const quizzesDB = dbClient.db("quizzesData");
    const quizzesCollection = quizzesDB.collection("quizzes");

    const lessonsDB = dbClient.db("lessonsData");
    const lessonsCollection = lessonsDB.collection("lessons");

    if (!id) {
        return NextResponse.json({
            success: false,
            error: "Quiz ID is required",
        });
    }

    const quiz = await quizzesCollection.findOne({ id });

    if (!quiz) {
        return NextResponse.json({ success: false, error: "Quiz not found" });
    }

    type HierarchyNode = {
        id: string;
        type: "quiz" | "lesson";
        title: string;
        children: HierarchyNode[] | null;
    } | null;

    async function buildHierarchy(
        nodeId: string,
        nodeType: "quiz" | "lesson",
        visited: Set<string> = new Set()
    ): Promise<HierarchyNode> {
        const uniqueKey = `${nodeType}:${nodeId}`;
        if (visited.has(uniqueKey)) return null; // Prevent circular references
        visited.add(uniqueKey);

        if (nodeType === "quiz") {
            const quizNode = await quizzesCollection.findOne({ id: nodeId });
            if (!quizNode) return null;

            // Quizzes can't have children, but can have a parent lesson
            let parentHierarchy: HierarchyNode | null = null;
            if (quizNode.parentId) {
                parentHierarchy = await buildHierarchy(quizNode.parentId, "lesson", visited);
            }

            const currentNode: HierarchyNode = {
                id: quizNode.id,
                type: "quiz",
                title: quizNode.title,
                children: null,
            };

            return parentHierarchy
                ? { ...parentHierarchy, children: [currentNode] }
                : currentNode;
        } else {
            const lessonNode = await lessonsCollection.findOne({ id: nodeId });
            if (!lessonNode) return null;

            // Find children quizzes
            const children: HierarchyNode[] = [];
            if (Array.isArray(lessonNode.children)) {
                for (const child of lessonNode.children) {
                    if (child.type === "quiz" && child.id) {
                        const quizChild = await buildHierarchy(child.id, "quiz", new Set(visited));
                        if (quizChild) children.push(quizChild);
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

    const hierarchy = await buildHierarchy(quiz.id, "quiz");

    return NextResponse.json({ success: true, tree: hierarchy });
}