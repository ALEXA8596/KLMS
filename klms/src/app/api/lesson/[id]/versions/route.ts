import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { applyPatch } from "diff";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/lesson/[id]/versions
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // TODO: Implement lesson versions logic
  const database = dbClient.db("lessonsData");
  const lessons = database.collection("lessons");

  if (!id) {
    return NextResponse.json({
      success: false,
      error: "Lesson ID is required",
    });
  }

  const lesson = await lessons.findOne({ id });
  if (!lesson) {
    return NextResponse.json({ success: false, error: "Lesson not found" });
  }

  const versions = [];
  for (let i = 0; i < lesson.history.length; i++) {
    const version = lesson.history[i];
    let content = lesson.content;

    // Apply patches in reverse to get historical content
    for (let j = lesson.patches.length - 1; j >= i; j--) {
      content = applyPatch(content, lesson.patches[j]);
    }

    versions.push({
      version: version.version,
      timestamp: version.timestamp,
      name: lesson.name,
      description: version.description,
      content: content,
      changelog: version.changelog || 'No changelog provided'
    });
  }

  return NextResponse.json({ success: true, versions });
}
