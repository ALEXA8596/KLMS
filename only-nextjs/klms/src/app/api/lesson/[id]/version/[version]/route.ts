import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { createPatch, applyPatch } from "diff";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/lesson/[id]/version/[version]
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  const version = searchParams.get("version");

  const database = dbClient.db("lessonsData");
  const lessonsCollection = database.collection("lessons");

  if (!id || !version) {
    return NextResponse.json({
      success: false,
      error: "Lesson ID and version are required",
    });
  }

  const lesson = await lessonsCollection.findOne({ id: id });

  if (!lesson) {
    return NextResponse.json({ success: false, error: "Lesson not found" });
  }

  // If requesting current version, return as is
  if (parseInt(version) === lesson.version) {
    return NextResponse.json({ success: true, lesson });
  }

  // Otherwise reconstruct the lesson from the version history
  let content = lesson.content;
  let name = lesson.name;
  let description = lesson.description;

  const targetVersion = parseInt(version);

  // Apply patches in reverse to get to the requested version
  for (let i = lesson.patches.length - 1; i >= targetVersion - 1; i--) {
    content = applyPatch(content, lesson.patches[i]);
    name = applyPatch(name, lesson.patches[i].name);
    description = applyPatch(description, lesson.patches[i].description);
  }

  // Ensure the content is valid after applying patches
  if (typeof content !== "string" || typeof name !== "string" || typeof description !== "string") {
    return NextResponse.json({
      success: false,
      error: "Invalid content after applying patches",
    });
  }
  
  // Return the reconstructed lesson
  return NextResponse.json({
    success: true,
    content,
    name,
    description,
    versionInfo: lesson.history[targetVersion - 1]
  });
}
