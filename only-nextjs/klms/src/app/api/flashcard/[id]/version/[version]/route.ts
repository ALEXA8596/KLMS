import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import * as jsondiffpatch from "jsondiffpatch";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/flashcard/[id]/version/[version]
export async function GET(request: NextRequest, params: { id: string; version: string }) {
    const id = params.id;
    const version = params.version;

    const database = dbClient.db("flashcardsData");
    const flashcardsCollection = database.collection("flashcards");

    if (!id || !version) {
        return NextResponse.json({
            success: false,
            error: "Flashcard set ID and version are required",
        });
    }

    const flashcardSet = await flashcardsCollection.findOne({ id: id });

    if (!flashcardSet) {
        return NextResponse.json({ success: false, error: "Flashcard set not found" });
    }

    const targetVersion = parseInt(version);

    if (isNaN(targetVersion) || targetVersion < 1 || targetVersion > flashcardSet.version) {
        return NextResponse.json({
            success: false,
            error: "Invalid version requested",
        }, { status: 400 });
    }
    // If requesting current version, return as is
    if (targetVersion === flashcardSet.version) {
        return NextResponse.json({ success: true, flashcardSet });
    }
    // Reconstruct the flashcard set from patches
    let reconstructedSet = {
        title: flashcardSet.title,
        description: flashcardSet.description,
        cards: flashcardSet.cards,
        parentId: flashcardSet.parentId,
    };

    // Apply patches in reverse to get to the requested version
    for (let i = flashcardSet.patches.length - 1; i >= targetVersion - 1; i--) {
        const patch = flashcardSet.patches[i];
        // @ts-ignore
        reconstructedSet = jsondiffpatch.unpatch(reconstructedSet, patch);
    }

    // Ensure the reconstructed set is valid
    if (typeof reconstructedSet !== "object" || !reconstructedSet.title || !Array.isArray(reconstructedSet.cards)) {
        return NextResponse.json({
            success: false,
            error: "Invalid flashcard set after applying patches",
        }, { status: 500 });
    }

    // Return the reconstructed flashcard set
    return NextResponse.json({
        success: true,
        flashcardSet: reconstructedSet,
        versionInfo: flashcardSet.history[targetVersion - 1],
    });
}