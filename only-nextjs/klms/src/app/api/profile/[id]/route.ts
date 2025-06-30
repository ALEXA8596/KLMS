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

// GET /api/profile/[id]
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({
      success: false,
      error: "User ID is required",
    });
  }

  const database = dbClient.db("userData");
  const userData = database.collection("users");

  const user = await userData.findOne({ id });
  if (!user) {
    return NextResponse.json({
      success: false,
      error: "User not found",
    });
  }

  const lessonDatabase = dbClient.db("lessonsData");
  const lessonsCollection = lessonDatabase.collection("lessons");
  const lessons = await lessonsCollection.find({ creatorId: id }).toArray();

  const lessonsCreatedWithNoParent = lessons.filter(
    (lesson) => !lesson.parentId
  );

  user.lessons = lessonsCreatedWithNoParent.map((lesson) => ({
    id: lesson.id,
    name: lesson.name,
    description: lesson.description,
    dateCreated: lesson.dateCreated,
  }));

  return NextResponse.json({ success: true, user });
}
