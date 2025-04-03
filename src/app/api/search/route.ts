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

    // Call the Stack AI API with a longer timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

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
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    // Get the response
    const result = await response.json();
    
    // Extract the output content
    const outputContent = result.outputs["out-0"];
    
    // Find the JSON array in the string response
    const jsonMatch = outputContent.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    
    if (jsonMatch) {
      try {
        const jsonArray = JSON.parse(jsonMatch[0]);
        return NextResponse.json(jsonArray);
      } catch (e) {
        console.error("JSON parsing error:", e);
        throw new Error("Failed to parse JSON from response");
      }
    } else {
      throw new Error("No JSON array found in response");
    }
    
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search for products. Please try again later." },
      { status: 500 }
    );
  }
}
