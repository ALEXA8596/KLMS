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

// GET /api/lessons/[id]
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

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
    return NextResponse.json({
      success: false,
      error: "Lesson not found",
    });
  }

  const usersDatabase = dbClient.db("userData");
  const author = await usersDatabase
    .collection("users")
    .findOne({ id: lesson.creatorId });

  // Fetch parent and children details
  const parent = lesson.parentId
    ? await lessons.findOne({ id: lesson.parentId })
    : null;
  const children =
    lesson.children.length > 0
      ? await lessons.find({ id: { $in: lesson.children } }).toArray()
      : [];

  return NextResponse.json({
    success: true,
    lesson: {
      ...lesson,
      parent: parent ? { id: parent.id, name: parent.name } : null,
      children: children.map((child) => ({ id: child.id, name: child.name })),
      creatorName: author ? author.username : "Unknown Author",
    },
  });
}
