import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: "Please provide a search query" });
    }

    // Simple API call
    const response = await fetch(
      "https://api.stack-ai.com/inference/v0/run/90d983fc-f852-4d72-b781-f93fb22f6c84/67e6048393d5490f2d932e58",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer 7963ab82-f620-4f3f-9ef4-02a66a58c222",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "user_id": "anonymous",
          "in-0": query
        })
      }
    );

    // Get the raw response
    const responseText = await response.text();
    
    // Return the raw response for debugging
    return NextResponse.json({ 
      status: response.status,
      statusText: response.statusText,
      rawResponse: responseText
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "API request failed", 
      message: error.message 
    });
  }
}
