import { NextRequest, NextResponse } from "next/server";

// GET /api/lesson/[id]/versions
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  // TODO: Implement lesson versions logic
  return NextResponse.json({ success: false, error: 'Not implemented' });
}
