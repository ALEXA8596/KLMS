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

// GET /api/search
export async function GET(request: NextRequest) {
  // get search query from request
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q");
  if (!query) {
    return NextResponse.json({
      success: false,
      error: "Search query is required",
    });
  }

  const userDb = dbClient.db("userData");
  const lessonDb = dbClient.db("lessonsData");
  const users = userDb.collection("users");
  const lessons = lessonDb.collection("lessons");

  const allUsers = await users.find().toArray();

  const allLessons = await lessons.find().toArray();

  // filter users by username
  const userResults = allUsers.filter((user) => 
    user.username.toLowerCase().includes(query.toLowerCase())
  ).map(user => ({
    id: user.id,
    username: user.username
  }));

  const lessonResults = allLessons.filter((lesson) =>
    lesson.name.toLowerCase().includes(query.toLowerCase()) ||
    lesson.description.toLowerCase().includes(query.toLowerCase()) ||
    lesson.content.toLowerCase().includes(query.toLowerCase())
  ).map(lesson => ({
    id: lesson.id,
    name: lesson.name,
    description: lesson.description,
    creatorId: lesson.creatorId,
    dateCreated: lesson.dateCreated
  }));

  return NextResponse.json({
    success: true,
    results: {
      users: userResults,
      lessons: lessonResults
    }
  });
}
