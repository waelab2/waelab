import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpointId = searchParams.get("endpoint_id");

  console.log(`🔍 Schema API: Received request for endpoint_id: ${endpointId}`);

  if (!endpointId) {
    return NextResponse.json(
      { error: "endpoint_id parameter is required" },
      { status: 400 },
    );
  }

  try {
    const schemaUrl = `https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=${encodeURIComponent(endpointId)}`;
    console.log(`🔍 Schema API: Fetching from: ${schemaUrl}`);
    console.log(`🔍 Schema API: Original endpoint_id: ${endpointId}`);
    console.log(
      `🔍 Schema API: Encoded endpoint_id: ${encodeURIComponent(endpointId)}`,
    );

    const response = await fetch(schemaUrl, {
      headers: {
        "User-Agent": "WaeLab/1.0",
      },
    });

    if (!response.ok) {
      console.error(
        `🔍 Schema API: Failed to fetch schema: ${response.status}`,
      );
      return NextResponse.json(
        { error: `Failed to fetch schema: ${response.status}` },
        { status: response.status },
      );
    }

    const schemaData = (await response.json()) as unknown;
    console.log(`🔍 Schema API: Successfully fetched schema for ${endpointId}`);

    return NextResponse.json(schemaData, {
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error fetching schema:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
