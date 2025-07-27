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

// GET /api/profile/self
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    if (!token || !token.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const database = dbClient.db("userData");
    const userData = database.collection("users");
    const user = await userData.findOne({
      username: token.name, 
    });
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Invalid authorization token",
      });
    }

    const userWithoutSessionCookies = { ...user };
    delete userWithoutSessionCookies.sessionCookies;
    delete userWithoutSessionCookies.hashedPassword;
    if (
      userWithoutSessionCookies.posts &&
      Array.isArray(userWithoutSessionCookies.posts)
    )
      userWithoutSessionCookies.posts = userWithoutSessionCookies.posts.slice(
        0,
        10
      );
    return NextResponse.json({
      success: true,
      user: userWithoutSessionCookies,
    });
  } catch (error) {
    console.error("Error fetching self profile:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/profile/self
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    if (!token || !token.sub || !token.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, profilePicture } = await request.json();

    if (!name || !description) {
      return NextResponse.json({
        success: false,
        error: "Name and description are required",
      });
    }

    const database = dbClient.db("userData");
    const userData = database.collection("users");
    const user = await userData.findOne({
      id: token.sub,
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
      });
    }

    const updatedUser = {
      ...user,
      name,
      description,
      profilePicture: profilePicture || user.profilePicture,
    };

    await userData.updateOne(
      { id: user.id },
      { $set: updatedUser }
    );

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating self profile:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}