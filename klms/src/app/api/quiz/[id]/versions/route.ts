import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import * as jsondiffpatch from "jsondiffpatch";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/quiz/[id]/versions
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

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
        return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
    }

    // Build versions array with content
    const versions = [];
    let reconstructedQuiz = {
        title: quiz.title,
        description: quiz.description,
        progressBarColor: quiz.progressBarColor,
        nrOfQuestions: quiz.nrOfQuestions,
        questions: quiz.questions,
    };
    for (let i = 0; i < quiz.history.length; i++) {
        // Apply patches in reverse to get historical content
        for (let j = quiz.patches.length - 1; j >= i; j--) {
            reconstructedQuiz = jsondiffpatch.patch(reconstructedQuiz, quiz.patches[j]) as typeof reconstructedQuiz;
        }
        versions.push({
            version: quiz.history[i].version,
            timestamp: quiz.history[i].timestamp,
            ...reconstructedQuiz,
            changelog: quiz.history[i].changelog || 'No changelog provided',
        });
    }

    return NextResponse.json({
        success: true,
        versions: versions
    });
}
