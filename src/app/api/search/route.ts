import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Call the Stack AI API
    const response = await fetch(
      "https://api.stack-ai.com/inference/v0/run/90d983fc-f852-4d72-b781-f93fb22f6c84/67e6048393d5490f2d932e58",
      {
        headers: {
          Authorization: "Bearer 7963ab82-f620-4f3f-9ef4-02a66a58c222",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          user_id: `${request.headers.get("x-forwarded-for") || "anonymous"}`,
          "in-0": query,
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    // Get the raw text response
    const result = await response.json();

    // The API might return an object with a text property or just a string
    // Handle both cases gracefully
    const content = typeof result === 'string'
      ? result
      : result.text || result.content || JSON.stringify(result);

    return NextResponse.json(content);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search for products. Please try again later." },
      { status: 500 }
    );
  }
}
