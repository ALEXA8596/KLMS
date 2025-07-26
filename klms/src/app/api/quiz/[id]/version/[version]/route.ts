import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import * as jsondiffpatch from "jsondiffpatch";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/quiz/[id]/version/[version]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string, version: string }> }) {
    const { id, version } = await params;

    if (!id || !version) {
        return NextResponse.json({
            success: false,
            error: "Quiz ID and version are required",
        }, { status: 400 });
    }

    const database = dbClient.db("quizzesData");
    const quizzes = database.collection("quizzes");

    const quiz = await quizzes.findOne({ id });

    if (!quiz) {
        return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
    }

    const targetVersion = parseInt(version);

    if (isNaN(targetVersion) || targetVersion < 1 || targetVersion > quiz.version) {
        return NextResponse.json({
            success: false,
            error: "Invalid version requested",
        }, { status: 400 });
    }

    // If requesting current version, return as is
    if (targetVersion === quiz.version) {
        return NextResponse.json({ success: true, quiz });
    }

    // Reconstruct the quiz from patches
    let reconstructedQuiz = {
        // id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        progressBarColor: quiz.progressBarColor,
        nrOfQuestions: quiz.nrOfQuestions,
        questions: quiz.questions,
        // creatorId: quiz.creatorId,
        // dateCreated: quiz.dateCreated,
        parentId: quiz.parentId,
        // treeHeight: quiz.treeHeight,
        // version: quiz.version,
        // patches: quiz.patches,
        // history: quiz.history,
    };

    // Apply patches in reverse to get to the requested version
    for (let i = quiz.patches.length - 1; i >= targetVersion - 1; i--) {
        const patch = quiz.patches[i];
        reconstructedQuiz = jsondiffpatch.patch(reconstructedQuiz, patch) as typeof reconstructedQuiz;
    }

    // Validate reconstructedQuiz
    if (
        typeof reconstructedQuiz.title !== "string" ||
        typeof reconstructedQuiz.description !== "string" ||
        typeof reconstructedQuiz.nrOfQuestions !== "number" ||
        !Array.isArray(reconstructedQuiz.questions)
    ) {
        return NextResponse.json({
            success: false,
            error: "Invalid quiz data after applying patches",
        }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        quiz: {
            ...reconstructedQuiz,
            id: quiz.id,
            creatorId: quiz.creatorId,
            dateCreated: quiz.dateCreated,
            parentId: quiz.parentId,
            treeHeight: quiz.treeHeight,
            version: targetVersion,
        },
        versionInfo: quiz.history[targetVersion - 1],
    });
}
