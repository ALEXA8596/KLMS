import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/flashcards/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({
            success: false,
            error: "Flashcard set ID is required",
        }, { status: 400 });
    }

    const database = dbClient.db("flashcardsData");
    const flashcards = database.collection("flashcards");
    const set = await flashcards.findOne({ id });

    if (!set) {
        return NextResponse.json({
            success: false,
            error: "Flashcard set not found",
        }, { status: 404 });
    }

    // Fetch creator info
    const usersDatabase = dbClient.db("userData");
    const creator = await usersDatabase
        .collection("users")
        .findOne({ id: set.creatorId });

    // Fetch parent lesson info if exists
    let parentLesson = null;
    if (set.parentId) {
        const lessonsDB = dbClient.db("lessonsData");
        parentLesson = await lessonsDB
            .collection("lessons")
            .findOne({ id: set.parentId });
    }
    
    return NextResponse.json({
        success: true,
        flashcardSet: {
            ...set,
            creatorName: creator ? creator.username : "Unknown Author",
        },
    });
}