import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { getToken } from "next-auth/jwt";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// POST /api/lessons/create
export async function POST(request: NextRequest) {
  const { name, description, content, parentId } = await request.json();

  if (!name || !description || !content) {
    return NextResponse.json(
      {
        success: false,
        error: "Name, description, and content are required",
      },
      { status: 400 }
    );
  }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "__Secure-authjs.session-token"
    });

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const userId = token.sub;

  const userDatabase = dbClient.db("userData");
  const userData = userDatabase.collection("users");
  const user = await userData.findOne({ id: userId });
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "User not found",
      },
      { status: 404 }
    );
  }

  const database = dbClient.db("lessonsData");
  const lessons = database.collection("lessons");

  let parentLesson = null;
  if (parentId) {
    parentLesson = await lessons.findOne({ id: parentId });
    if (!parentLesson) {
      return NextResponse.json({
        success: false,
        error: "Parent lesson not found",
      });
    }
    const parentHeight = parentLesson.treeHeight || 1;
    if (parentHeight >= 4) {
      return NextResponse.json({
        success: false,
        error: "Maximum tree height exceeded",
      });
    }
  }

  const lesson = {
    id: uuidv4() as string,
    name,
    description,
    content,
    creatorId: user.id,
    dateCreated: Date.now(),
    parentId: parentId || null,
    treeHeight: parentLesson ? parentLesson.treeHeight + 1 : 1,
    version: 1,
    patches: [], // Array to store version patches
    history: [
      {
        version: 1,
        timestamp: Date.now(),
        creatorId: user.id,
        changelog: "Initial version",
      },
    ],
    children: [], // Array to store child lesson IDs
  };

  await lessons.insertOne(lesson);

  if (parentLesson) {
    await lessons.updateOne(
      { id: parentId },
      // @ts-ignore
      { $push: { children: {
        id: lesson.id,
        type: "lesson", // Type can be 'lesson' or 'quiz'
      } } }
    );
  }

  return NextResponse.json(
    {
      success: true,
      lessonId: lesson.id,
    },
    { status: 201 }
  );
}
