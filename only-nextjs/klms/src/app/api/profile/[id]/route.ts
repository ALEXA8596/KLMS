import { NextRequest, NextResponse } from "next/server";

// GET /api/profile/[id]
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');

  // TODO: Implement profile by id logic
  return NextResponse.json({ success: false, error: 'Not implemented' });
}
