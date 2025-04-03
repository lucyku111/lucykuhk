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
  
  // Parse the JSON response
  const result = await response.json();
  return result;
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
    
    // Check if the API returned an error
    if (result.errorType || result.errorMessage) {
      return NextResponse.json([{
        "Product": "Search service temporarily unavailable",
        "Price": "Please try again later",
        "Store": "Error: " + (result.errorMessage || "Unknown error"),
        "URL": "#"
      }]);
    }
    
    // Check if we have outputs in the expected format
    if (result.outputs && result.outputs["out-0"]) {
      const outputContent = result.outputs["out-0"];
      
      // Try to extract product data from the output
      try {
        // If the output is already a JSON array of products
        if (Array.isArray(outputContent) && outputContent.length > 0 && outputContent[0].Product) {
          return NextResponse.json(outputContent);
        }
        
        // If the output is a string containing a JSON array
        const jsonMatch = outputContent.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if (jsonMatch) {
          const products = JSON.parse(jsonMatch[0]);
          return NextResponse.json(products);
        }
        
        // If we couldn't extract products, return a formatted message
        return NextResponse.json([{
          "Product": "No products found for: " + searchQuery,
          "Price": "Try a different search term",
          "Store": "N/A",
          "URL": "#"
        }]);
      } catch (e) {
        // If there was an error processing the output
        return NextResponse.json([{
          "Product": "Error processing search results",
          "Price": "Please try again",
          "Store": "N/A",
          "URL": "#"
        }]);
      }
    }
    
    // If the response doesn't have the expected structure
    return NextResponse.json([{
      "Product": "Unexpected response format",
      "Price": "Please try again later",
      "Store": "N/A",
      "URL": "#"
    }]);
    
  } catch (error) {
    return NextResponse.json([{
      "Product": "Search error",
      "Price": "Please try again later",
      "Store": error.message || "Unknown error",
      "URL": "#"
    }]);
  }
}
