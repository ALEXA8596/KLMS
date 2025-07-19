import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import * as jsondiffpatch from "jsondiffpatch";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/flashcard/[id]/versions
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({
            success: false,
            error: "Flashcard ID is required",
        }, { status: 400 });
    }

    const database = dbClient.db("flashcardsData");
    const flashcards = database.collection("flashcards");

    const flashcard = await flashcards.findOne({ id });

    if (!flashcard) {
        return NextResponse.json({ success: false, error: "Flashcard not found" }, { status: 404 });
    }

    // Build versions array with content
    const versions = [];
    let reconstructedFlashcard = {
        name: flashcard.name,
        description: flashcard.description,
        cards: flashcard.cards
    };
    for (let i = 0; i < flashcard.history.length; i++) {
        // Apply patches in reverse to get historical content
        for (let j = flashcard.patches.length - 1; j >= i; j--) {
            reconstructedFlashcard = jsondiffpatch.patch(reconstructedFlashcard, flashcard.patches[j]) as typeof reconstructedFlashcard;
        }
        versions.push({
            version: flashcard.history[i].version,
            timestamp: flashcard.history[i].timestamp,
            ...reconstructedFlashcard,
            changelog: flashcard.history[i].changelog || 'No changelog provided',
        });
    }

    return NextResponse.json({
        success: true,
        versions: versions
    });
}
