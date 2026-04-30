import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!agentId || !apiKey) {
    return NextResponse.json({ error: "Missing ElevenLabs configuration" }, { status: 500 });
  }

  try {
    // Fetch conversations for the specific agent
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${agentId}&page_size=20`,
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
    
    // Enrich conversations with details to get phone numbers/metadata
    if (data.conversations && data.conversations.length > 0) {
      const enrichedConversations = await Promise.all(
        data.conversations.map(async (conv: any) => {
          try {
            const detailRes = await fetch(
              `https://api.elevenlabs.io/v1/convai/conversations/${conv.conversation_id}`,
              {
                headers: {
                  "xi-api-key": apiKey,
                },
              }
            );
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              // Combine summary and detail
              return { ...conv, ...detailData };
            }
            return conv;
          } catch (err) {
            console.error(`Error enriching conversation ${conv.conversation_id}:`, err);
            return conv;
          }
        })
      );
      data.conversations = enrichedConversations;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching ElevenLabs conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
