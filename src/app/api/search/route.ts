import { NextRequest, NextResponse } from "next/server";

// Helper function to query the Stack AI API with new credentials
async function query(data) {
  const response = await fetch(
    "https://api.stack-ai.com/inference/v0/run/a346ade7-c4ef-4997-8aab-c96c2d88f56f/67ee23605586884182ffb38d",
    {
      headers: {
        'Authorization': 'Bearer 7362ca54-76ff-43b2-b705-e50015e54d15',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  
  // Return the raw response
  return response;
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
    const response = await query({
      "user_id": "anonymous-user",
      "in-0": searchQuery
    });
    
    // Get response details
    const status = response.status;
    const statusText = response.statusText;
    const contentType = response.headers.get('content-type');
    
    // Get the raw response text
    const responseText = await response.text();
    
    // Return all the raw information for debugging
    return NextResponse.json({
      query: searchQuery,
      status: status,
      statusText: statusText,
      contentType: contentType,
      responseText: responseText
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "API request failed", 
      message: error.message 
    });
  }
}
