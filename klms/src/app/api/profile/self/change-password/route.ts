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

// POST /api/profile/self/resetPassword
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    if (!token || !token.sub || !token.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: "Old password and new password are required",
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

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.hashedPassword
    );
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: "Old password is incorrect",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await userData.updateOne(
      { id: user.id },
      { $set: { hashedPassword: hashedNewPassword } }
    );
    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
