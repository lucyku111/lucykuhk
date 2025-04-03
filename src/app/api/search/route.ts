import { NextRequest, NextResponse } from "next/server";

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
          Authorization: "Bearer 7362ca54-76ff-43b2-b705-e50015e54d15",
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

    // Get the response
    const result = await response.json();
    
    // Extract the output content
    const outputContent = result.outputs["out-0"];
    
    // Try to parse the content as JSON if it's a string
    let parsedContent;
    if (typeof outputContent === 'string') {
      try {
        parsedContent = JSON.parse(outputContent);
        return NextResponse.json(parsedContent);
      } catch (e) {
        // If parsing fails, return the string as is
        return NextResponse.json(outputContent);
      }
    }
    
    // If it's already an object, return it directly
    return NextResponse.json(outputContent);
    
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search for products. Please try again later." },
      { status: 500 }
    );
  }
}
