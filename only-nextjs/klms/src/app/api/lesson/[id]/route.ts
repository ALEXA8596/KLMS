import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { createPatch, applyPatch } from "diff";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { getToken } from "next-auth/jwt";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// PUT, DELETE /api/lesson/[id]
export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });
    if (!token || !token.sub) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    const { content, description, name, changelog } = await request.json();

    if (!content || !description || !name) {
      return NextResponse.json({
        success: false,
        error: "Lesson ID, content, description, and name are required",
      });
    }

    const database = dbClient.db("lessonsData");
    const lessons = database.collection("lessons");

    const currentLesson = await lessons.findOne({ id });
    if (!currentLesson) {
      return NextResponse.json({ success: false, error: "Lesson not found" });
    }

    // Generate patch from previous to new content
    const patch = createPatch(
      `lesson_${id}`,
      currentLesson.content,
      content,
      "Previous Version",
      "New Version"
    );

    const namePatch = createPatch(
      `lesson_${id}_name`,
      currentLesson.name,
      name,
      "Previous Version",
      "New Version"
    );

    const descriptionPatch = createPatch(
      `lesson_${id}_description`,
      currentLesson.description,
      description,
      "Previous Version",
      "New Version"
    );

    // Update lesson with new content and store patch
    // Prepare new patches and history arrays on the server
    const newPatch = {
      ...currentLesson,
      content: patch,
      name: namePatch,
      description: descriptionPatch,
    };
    const newHistory = {
      version: currentLesson.version + 1,
      timestamp: Date.now(),
      creatorId: token.sub,
      changelog: changelog || "No changelog provided",
    };

    const updatedPatches = Array.isArray(currentLesson.patches)
      ? [...currentLesson.patches, newPatch]
      : [newPatch];

    const updatedHistory = Array.isArray(currentLesson.history)
      ? [...currentLesson.history, newHistory]
      : [newHistory];

    await lessons.updateOne(
      { id },
      {
      $set: {
        content,
        description,
        name,
        patches: updatedPatches,
        history: updatedHistory,
        version: currentLesson.version + 1,
      },
      }
    );

    await dbClient.connect();
    return NextResponse.json({ success: true, message: "Lesson updated", content: {
      id,
      content,
      description,
      name,
      version: currentLesson.version + 1,
      changelog: changelog || "No changelog provided",
    } });
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

// export async function GET(request: NextRequest) {
//   const token =  await getToken({
//     req: request,
//     secret: process.env.AUTH_SECRET,
//   });
//   console.log("Token:", token);

//   return token
//     ? NextResponse.json({ success: true, user: token })
//     : NextResponse.json({ success: false, error: "Unauthorized" });
// }

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  // TODO: Implement lesson delete logic
  return NextResponse.json({ success: false, error: "Not implemented" });
}
