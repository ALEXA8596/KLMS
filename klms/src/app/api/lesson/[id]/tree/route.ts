import { NextRequest, NextResponse } from "next/server";

// GET /api/lesson/[id]/tree
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  // TODO: Implement lesson tree logic
  return Response.json({ success: false, error: 'Not implemented' });
}
