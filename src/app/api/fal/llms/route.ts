import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get("model_id");

  console.log(`🔍 LLMs API: Received request for model_id: ${modelId}`);

  if (!modelId) {
    return NextResponse.json(
      { error: "model_id parameter is required" },
      { status: 400 },
    );
  }

  try {
    const llmsUrl = `https://fal.ai/models/${encodeURIComponent(modelId)}/llms.txt`;
    console.log(`🔍 LLMs API: Fetching from: ${llmsUrl}`);
    console.log(`🔍 LLMs API: Original model_id: ${modelId}`);
    console.log(
      `🔍 LLMs API: Encoded model_id: ${encodeURIComponent(modelId)}`,
    );

    const response = await fetch(llmsUrl, {
      headers: {
        "User-Agent": "WaeLab/1.0",
      },
    });

    if (!response.ok) {
      console.error(
        `🔍 LLMs API: Failed to fetch LLMs content: ${response.status}`,
      );
      return NextResponse.json(
        { error: `Failed to fetch LLMs content: ${response.status}` },
        { status: response.status },
      );
    }

    const llmsContent = await response.text();
    console.log(
      `🔍 LLMs API: Successfully fetched LLMs content for ${modelId}`,
    );

    return new NextResponse(llmsContent, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error fetching LLMs content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
