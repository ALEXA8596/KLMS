import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// POST /api/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, confirmedPassword, tos } = body;

    if (password !== confirmedPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match" },
        { status: 400 }
      );
    }
    if (!username || !email || !password || !confirmedPassword || !tos) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const database = dbClient.db("userData");
    const userData = database.collection("users");

    // Check if the username or email already exists
    const existingUser = await userData.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Username or email already exists" },
        { status: 400 }
      );
    }

    const user = {
      username,
      email,
      hashedPassword: bcrypt.hashSync(password, 10),
      id: uuidv4(),
      timestampCreated: Date.now(),
    };

    await userData.insertOne(user);

    return NextResponse.json(
      { success: true, user: { ...user, password: undefined } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in registration:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
