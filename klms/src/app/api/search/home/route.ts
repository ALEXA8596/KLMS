import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/search/home
export async function GET(request: NextRequest) {

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

// Fetch the 10 most recent documents from each collection, sorted by dateCreated descending
const [userResults, lessonResults, quizResults, flashcardResults, learnResults] = await Promise.all([
    users.find().sort({ dateCreated: -1 }).limit(10).toArray(),
    lessons.find().sort({ dateCreated: -1 }).limit(10).toArray(),
    quizzes.find().sort({ dateCreated: -1 }).limit(10).toArray(),
    flashcards.find().sort({ dateCreated: -1 }).limit(10).toArray(),
    learn.find().sort({ dateCreated: -1 }).limit(10).toArray(),
]);

  return NextResponse.json({
    success: true,
    results: {
        userResults,
        lessonResults,
        quizResults,
        flashcardResults,
        learnResults,
    }
  });
}
