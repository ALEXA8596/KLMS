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

// GET /api/profile/self/lessons
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "__Secure-authjs.session-token"
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

    const lessonsDatabase = dbClient.db("lessonsData");
    const lessons = lessonsDatabase.collection("lessons");
    const allLessons = await lessons.find({ creatorId: user.id }).toArray();
    // console.log(allLessons);
    const lessonsWithNoParent = allLessons.filter((lesson) => !lesson.parentId);
    // console.log(lessonsWithNoParent);
    async function getChildrenRecursive(lessonId: string): Promise<any[]> {
      const children = await lessons.find({ parentId: lessonId }).toArray();
      if (children.length === 0) return [];

      const childrenWithChildren = await Promise.all(
        children.map(async (child) => ({
          ...child,
          children: await getChildrenRecursive(child.id),
        }))
      );

      return childrenWithChildren;
    }

    for (const lesson of lessonsWithNoParent) {
      array.push({
        ...lesson,
        children: await getChildrenRecursive(lesson.id),
      });
    }

    return NextResponse.json({ success: true, lessons: array });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
