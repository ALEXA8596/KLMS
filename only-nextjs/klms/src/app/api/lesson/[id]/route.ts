import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { createPatch, applyPatch } from "diff";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const uri: string = process.env.MONGODB_URI ?? "";
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const dbClient = new MongoClient(uri);

// PUT, DELETE /api/lesson/[id]
export async function PUT(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  // TODO: Implement lesson update logic
  return NextResponse.json({ success: false, error: 'Not implemented' });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  // TODO: Implement lesson delete logic
  return NextResponse.json({ success: false, error: 'Not implemented' });
}
