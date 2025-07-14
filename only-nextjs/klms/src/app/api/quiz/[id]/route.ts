import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getToken } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";
import * as jsondiffpatch from "jsondiffpatch";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// PUT, DELETE /api/quiz/[id]
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
        const { title, description, progressBarColor, nrOfQuestions, questions, changelog } = await request.json();

        if (!id || !title || !description || !nrOfQuestions || !questions) {
            return NextResponse.json({
                success: false,
                error: "Quiz ID, title, description, nrOfQuestions, and questions are required",
            });
        }

        const database = dbClient.db("quizzesData");
        const quizzes = database.collection("quizzes");

        const currentQuiz = await quizzes.findOne({ id });
        if (!currentQuiz) {
            return NextResponse.json({ success: false, error: "Quiz not found" });
        }

        // Generate JSON diff patch using jsondiffpatch
        const patch = jsondiffpatch.diff(
            {
                title: currentQuiz.title,
                description: currentQuiz.description,
                progressBarColor: currentQuiz.progressBarColor,
                nrOfQuestions: currentQuiz.nrOfQuestions,
                questions: currentQuiz.questions,
            },
            {
                title,
                description,
                progressBarColor,
                nrOfQuestions,
                questions,
            }
        );

        await quizzes.updateOne(
            { id },
            {
                $set: {
                    title,
                    description,
                    progressBarColor,
                    nrOfQuestions,
                    questions,
                },
                // @ts-ignore
                $push: {
                    patches: patch,
                    history: {
                        version: currentQuiz.version + 1,
                        timestamp: Date.now(),
                        creatorId: token.sub,
                        changelog: changelog || "No changelog provided",
                    },
                },
                $inc: { version: 1 },
            }
        );

        return NextResponse.json({
            success: true,
            message: "Quiz updated",
            content: {
                id,
                title,
                description,
                progressBarColor,
                nrOfQuestions,
                questions,
                version: currentQuiz.version + 1,
                changelog: changelog || "No changelog provided",
            },
        });
    } catch (error) {
        console.error("Error updating quiz:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update quiz" },
            { status: 500 }
        );
    }
}

/**
 * Make sure that when this is called, the user is told that the quiz will be deleted.
 */
export async function DELETE(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    const database = dbClient.db("quizzesData");
    const quizzes = database.collection("quizzes");

    const lessonsDB = dbClient.db("lessonsData");
    const lessons = lessonsDB.collection("lessons");

    const quiz = await quizzes.findOne({ id });
    if (!quiz || !id) {
        return NextResponse.json({ success: false, error: "Quiz not found" });
    }

    // Remove quiz from parent's children array if it has a parent
    if (quiz.parentId) {
        await lessons.updateOne(
            { id: quiz.parentId },
            // @ts-ignore
            { $pull: { children: { id: quiz.id } } }
        );
    }

    await quizzes.deleteOne({ id: quiz.id });

    return NextResponse.json({
        success: true,
        message: "Quiz deleted successfully",
    });
}