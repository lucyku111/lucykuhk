import { NextRequest, NextResponse } from "next/server";

// Remove the edge runtime since it's causing issues
// export const runtime = 'edge';

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

    // Detect if we're running in Netlify
    const isNetlify = process.env.NETLIFY === 'true';
    const timeoutDuration = isNetlify ? 25000 : 15000; // 25 seconds for Netlify, 15 for local

    // Increase timeout for local development
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    try {
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

      const result = await response.json();
      const outputContent = result.outputs["out-0"];
      
      const jsonMatch = outputContent.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      
      if (jsonMatch) {
        const jsonArray = JSON.parse(jsonMatch[0]);
        return NextResponse.json(jsonArray);
      }
      
      return NextResponse.json([{
        "Product": "No results found",
        "Price": "N/A",
        "Store": "N/A",
        "URL": "#"
      }]);

    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        return NextResponse.json([{
          "Product": "Search timeout - please try again",
          "Price": "N/A",
          "Store": "N/A",
          "URL": "#"
        }]);
      }
      throw fetchError;
    }
    
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json([{
      "Product": "Error occurred - please try again later",
      "Price": "N/A",
      "Store": "N/A",
      "URL": "#"
    }]);
  }
}
