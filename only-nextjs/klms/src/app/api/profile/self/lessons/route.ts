import { NextRequest, NextResponse } from "next/server";

// GET /api/profile/self/lessons
export async function GET(request: NextRequest) {
  // TODO: Implement self lessons logic
  return NextResponse.json({ success: false, error: 'Not implemented' });
}
