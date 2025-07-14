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

    await lessons.updateOne(
      { id },
      {
        $set: {
          content,
          description,
        },
        // @ts-ignore
        $push: {
          patches: {
            content: patch,
            name: namePatch,
            description: descriptionPatch,
          },
          history: {
            version: currentLesson.version + 1,
            timestamp: Date.now(),
            creatorId: token.id,
            changelog: changelog || "No changelog provided",
          },
        },
        $inc: { version: 1 },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Lesson updated",
      content: {
        id,
        content,
        description,
        name,
        version: currentLesson.version + 1,
        changelog: changelog || "No changelog provided",
      },
    });
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

/**
 Make sure that when this is called, the user is told that the lesson's children will be deleted too.
*/
export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  const database = dbClient.db("lessonsData");
  const lessons = database.collection("lessons");

  const quizzesDB = dbClient.db("quizzesData");
  const quizzes = quizzesDB.collection("quizzes");

  const lesson = await lessons.findOne({ id });
  if (!lesson || !id) {
    return NextResponse.json({ success: false, error: "Lesson not found" });
  }

  // Remove lesson from parent's children array
  if (lesson.parentId) {
    await lessons.updateOne(
      { id: lesson.parentId },
      // @ts-ignore
      { $pull: { children: {
        id: lesson.id,
      } } }
    );
  }

  // Recursively delete all children
  async function deleteChildren(page: {
    id: string;
    type: string; // 'lesson' or 'quiz'
  }) {
    if( page.type === 'quiz') {
      // Quizzes can't have children
      await quizzes.deleteOne({ id: page.id });
      return;
    }

    const lessonDoc = await lessons.findOne({ id: page.id });
    const children = lessonDoc?.children || [];
    for (const child of children) {
      await deleteChildren(child);
    }

    await lessons.deleteOne({ id: page.id });
  }

  await deleteChildren({ id, type: 'lesson' });

  return NextResponse.json({
    success: true,
    message: "Lesson and its children deleted successfully",
  });
}
