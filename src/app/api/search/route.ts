import { NextRequest, NextResponse } from "next/server";

// Helper function to query the Stack AI API
async function query(data) {
  const response = await fetch(
    "https://api.stack-ai.com/inference/v0/run/90d983fc-f852-4d72-b781-f93fb22f6c84/67e6048393d5490f2d932e58",
    {
      headers: {
        'Authorization': 'Bearer 7963ab82-f620-4f3f-9ef4-02a66a58c222',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  
  // Get the raw response text
  const responseText = await response.text();
  
  // Try to parse as JSON, but return the text if it fails
  try {
    return JSON.parse(responseText);
  } catch (e) {
    return { rawResponse: responseText };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query: searchQuery } = body;

    if (!searchQuery) {
      return NextResponse.json([{
        "Product": "Please enter a search query",
        "Price": "N/A",
        "Store": "N/A",
        "URL": "#"
      }]);
    }

    // Use the query function with the same parameters
    const result = await query({
      "user_id": "anonymous-user",
      "in-0": searchQuery
    });
    
    // Return the raw result for debugging
    return NextResponse.json({
      query: searchQuery,
      result: result
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "API request failed", 
      message: error.message 
    });
  }
}
