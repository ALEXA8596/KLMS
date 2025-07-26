import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/flashcard/[id]/export
export async function GET(request: NextRequest, params: { id: string }) {
    const id = params.id;
    
    if (!id) {
        return NextResponse.json(
        { error: "Flashcard ID is required" },
        { status: 400 }
        );
    }
    
    const database = dbClient.db("flashcardsData");
    const flashcardsCollection = database.collection("flashcards");
    
    const flashcardSet = await flashcardsCollection.findOne({ id: id });
    
    if (!flashcardSet) {
        return NextResponse.json(
        { error: "Flashcard not found" },
        { status: 404 }
        );
    }
    
    // Convert the flashcard set to a format suitable for export
    const exportData = {
        id: flashcardSet.id,
        title: flashcardSet.title,
        description: flashcardSet.description,
        cards: flashcardSet.cards || [],
    };

    // convert the cards to CSV format
    const csvContent = exportData.cards.map((card: { frontHTML: any; backHTML: any; }) => {
        return `"${card.frontHTML}","${card.backHTML}"`; // Assuming cards have front and back properties
    }).join("\n");

    return NextResponse.json({ ...exportData, csv: csvContent }, { status: 200 });
}