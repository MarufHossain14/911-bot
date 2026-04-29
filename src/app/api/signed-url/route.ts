import { NextResponse } from "next/server";

export async function GET() {
  // NEXT_PUBLIC_ vars are accessible on the server too
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!agentId || agentId === "your_agent_id_here") {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not set in .env.local" },
      { status: 500 }
    );
  }
  
  // If no API key is provided, we can't get a signed URL.
  // However, for public agents, the frontend could just use the agentId directly.
  if (!apiKey || apiKey === "your_elevenlabs_api_key_here") {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not set in .env.local" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: { "xi-api-key": apiKey },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `ElevenLabs error (${response.status}): ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
