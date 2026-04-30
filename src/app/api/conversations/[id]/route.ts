import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing ElevenLabs API Key" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
      {
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log(`Fetched detail for ${conversationId}:`, {
      hasTranscript: !!data.transcript,
      messageCount: data.transcript?.length || 0
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
