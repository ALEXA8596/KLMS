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

// PUT /api/flashcard/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string[] }> },
) {
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

    const { id } = await params;
    const { title, description, cards, changelog } = await request.json();

    if (!id || !title || !description || !cards || !Array.isArray(cards)) {
      return NextResponse.json({
        success: false,
        error: "Flashcard ID, title, description, and cards are required",
      });
    }

    const database = dbClient.db("flashcardsData");
    const flashcards = database.collection("flashcards");

    const currentFlashcard = await flashcards.findOne({ id });
    if (!currentFlashcard) {
      return NextResponse.json({ success: false, error: "Flashcard not found" });
    }

    // Generate JSON diff patch using jsondiffpatch
    const patch = jsondiffpatch.diff(
      {
        title: currentFlashcard.title,
        description: currentFlashcard.description,
        cards: currentFlashcard.cards,
      },
      {
        title,
        description,
        cards,
      }
    );

    // Update the flashcard in the database
    await flashcards.updateOne(
      { id },
      {
        $set: {
          title,
          description,
          cards,
          patches: [
            ...(currentFlashcard.patches || []),
            {
              version: currentFlashcard.version + 1,
              timestamp: Date.now(),
              changes: patch ? [patch] : [],
            },
          ],
          history: [
            ...(currentFlashcard.history || []),
            {
              version: currentFlashcard.version + 1,
              timestamp: Date.now(),
              creatorId: token.sub,
              changelog,
            },
          ],
          version: currentFlashcard.version + 1,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
