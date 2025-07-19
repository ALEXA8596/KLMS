import { generateLesson, promptToSendToUser } from "@/utils/LLMs/generateLesson";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    return NextResponse.json({
        prompt: promptToSendToUser
    })
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    if (!token || !token.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, options } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    const lesson = await generateLesson(
      topic,
      options ? options : { provider: "hackclub" }
    );

    return NextResponse.json({ lesson }, { status: 200 });
  } catch (error) {
    console.error("Error generating lesson:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
