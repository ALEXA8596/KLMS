import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { createPatch, applyPatch } from "diff";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { getToken } from "next-auth/jwt";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// GET /api/profile/self/flashcards
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });
    if (!token || !token.sub || !token.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const array = [];
    const id = token.sub; // User ID from the token
    // const username = token.name; // Username from the token

    const database = dbClient.db("userData");
    const userData = database.collection("users");

    const user = await userData.findOne({ id });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const flashcardsData = dbClient.db("flashcardsData");
    const flashcards = flashcardsData.collection("flashcards");
    const allFlashcards = await flashcards.find({ creatorId: user.id }).toArray();

    return NextResponse.json({ success: true, flashcards: allFlashcards });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
