import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

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
  const quizDb = dbClient.db("quizzesData");
  const flashcardDb = dbClient.db("flashcardsData");
  const learnDb = dbClient.db("learnData");
  const users = userDb.collection("users");
  const lessons = lessonDb.collection("lessons");
  const quizzes = quizDb.collection("quizzes");
  const flashcards = flashcardDb.collection("flashcards");
  const learn = learnDb.collection("learn");

  const allUsers = await users.find().toArray();

  const allLessons = await lessons.find().toArray();

  // filter users by username
  let userResults: { id: any; username: any; }[] = [];

  try {
    userResults = allUsers.filter((user) =>
      user.username.toLowerCase().includes(query.toLowerCase())
    ).map(user => ({
      id: user.id,
      username: user.username
    }));
  } catch {
    userResults = [];
  }

  let lessonResults: { id: any; name: any; description: any; creatorId: any; dateCreated: any; }[] = [];
  let quizResults = [];
  let flashcardResults = [];
  let learnResults = [];

  try {
    lessonResults = allLessons.filter((lesson) =>
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
  } catch {
    lessonResults = [];
  }

  try {
    quizResults = await quizzes.find({
      title: { $regex: query, $options: "i" }
    }).toArray();
  } catch {
    quizResults = [];
  }

  try {
    flashcardResults = await flashcards.find({
      title: { $regex: query, $options: "i" }
    }).toArray();
  } catch {
    flashcardResults = [];
  }

  try {
    learnResults = await learn.find({
      title: { $regex: query, $options: "i" }
    }).toArray();
  } catch {
    learnResults = [];
  }

  return NextResponse.json({
    success: true,
    results: {
      users: userResults,
      lessons: lessonResults
    }
  });
}
