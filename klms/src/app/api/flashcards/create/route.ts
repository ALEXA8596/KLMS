import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { getToken } from "next-auth/jwt";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

type Flashcards = {
    id: string;
    title: string;
    description: string;
    creatorId: string;
    cards: Array<{
        front: string;
        back: string;
    }>;
    parentId?: string | null;
    treeHeight: number;
    dateCreated: number;
    version: number;
    patches: Array<{
        version: number;
        timestamp: number;
        changes: Array<{
            field: string;
            oldValue: any;
            newValue: any;
        }>;
    }>;
    history: Array<{
        version: number;
        timestamp: number;
        creatorId: string;
        changelog: string;
    }>;
}

// POST /api/flashcards/create
export async function POST(request: NextRequest) {
    const { title, description, cards, parentId } = await request.json();
    
    if (!title || !description || !cards || !Array.isArray(cards) || cards.length === 0) {
        return NextResponse.json(
        {
            success: false,
            error: "Title, description, and at least one card are required",
        },
        { status: 400 }
        );
    }
    
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "__Secure-authjs.session-token"
    });
    
    if (!token) {
        return NextResponse.json(
        {
            success: false,
            error: "Unauthorized",
        },
        { status: 401 }
        );
    }
    
    const userId = token.sub;

    if(!userId) {
        return NextResponse.json(
            {
                success: false,
                error: "User ID not found; There was an error with authentication. Try signing out and signing back in.",
            },
            { status: 401 }
        );
    }

    console.log(userId, "User ID from token");

    const userDatabase = dbClient.db("userData");
    const userData = userDatabase.collection("users");
    const user = await userData.findOne({ id: userId });
    if (!user) {
        return NextResponse.json(
        {
            success: false,
            error: "User not found",
        },
        { status: 404 }
        );
    }
    
    const database = dbClient.db("flashcardsData");
    const flashcardsCollection = database.collection<Flashcards>("flashcards");
    
    // Check if parent lesson exists if parentId is provided
    let parentLesson = null;
    if (parentId) {
        const lessonsDB = dbClient.db("lessonsData");
        parentLesson = await lessonsDB.collection("lessons").findOne({ id: parentId });
        if (!parentLesson) {
            return NextResponse.json({
                success: false,
                error: "Parent lesson not found",
            }, { status: 404 });
        }
    }

    const newFlashcardSet: Flashcards = {
        id: uuidv4(),
        title,
        description,
        creatorId: userId,
        cards,
        parentId: parentId || null,
        treeHeight: parentLesson ? parentLesson.treeHeight + 1 : 1,
        dateCreated: Date.now(),
        version: 1,
        patches: [], // Array to store version patches
        history: [
            {
                version: 1,
                timestamp: Date.now(),
                creatorId: user.id,
                changelog: "Initial version",
            },
        ],

    };
    
    await flashcardsCollection.insertOne(newFlashcardSet);
    
    return NextResponse.json({
        success: true,
        flashcardSet: newFlashcardSet,
    });
}