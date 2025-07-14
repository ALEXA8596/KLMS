import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/quizzes/[id]
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({
            success: false,
            error: "Quiz ID is required",
        }, { status: 400 });
    }

    const database = dbClient.db("quizzesData");
    const quizzes = database.collection("quizzes");
    const quiz = await quizzes.findOne({ id });

    if (!quiz) {
        return NextResponse.json({
            success: false,
            error: "Quiz not found",
        }, { status: 404 });
    }

    // Fetch creator info
    const usersDatabase = dbClient.db("userData");
    const creator = await usersDatabase
        .collection("users")
        .findOne({ id: quiz.creatorId });

    // Fetch parent lesson info if exists
    let parentLesson = null;
    if (quiz.parentId) {
        const lessonsDB = dbClient.db("lessonsData");
        parentLesson = await lessonsDB
            .collection("lessons")
            .findOne({ id: quiz.parentId });
    }

    return NextResponse.json({
        success: true,
        quiz: {
            ...quiz,
            creatorName: creator ? creator.username : "Unknown Author",
            parent: parentLesson
                ? { id: parentLesson.id, name: parentLesson.name }
                : null,
        },
    });
}