import { NextRequest, NextResponse } from "next/server";

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
