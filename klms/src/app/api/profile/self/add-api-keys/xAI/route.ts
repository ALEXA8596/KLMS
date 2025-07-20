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

export async function POST(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
    });

    if (!token || !token.sub) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { apiKey } = await req.json();
    if (!apiKey) {
        return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    try {
        const client = await dbClient.connect();
        const db = client.db("userData");
        const user = await db.collection("users").findOne({ id: token.sub });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const newApiKey = {
            key: apiKey,
            userId: user.id,
            provider: "xAI",
        };

        // check whether user has apiKeys attr. If not, create it
        if (!user.apiKeys) {
            user.apiKeys = [];
        }
        user.apiKeys.push(newApiKey);

        // Update the user document with the new API key
        await db.collection("users").updateOne(
            { id: user.id },
            { $set: { apiKeys: user.apiKeys } }
        );

        await client.close();

        return NextResponse.json({ success: true, apiKey: newApiKey });
    } catch (error) {
        console.error("Error adding API key:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
