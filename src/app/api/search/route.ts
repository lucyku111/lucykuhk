import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json([{
        "Product": "Please enter a search query",
        "Price": "N/A",
        "Store": "N/A",
        "URL": "#"
      }]);
    }

    // Shorter timeout to avoid server timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      // Simplified API call without retries
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

      // Handle non-OK responses
      if (!response.ok) {
        return NextResponse.json([{
          "Product": `Search error (${response.status})`,
          "Price": "N/A",
          "Store": "N/A",
          "URL": "#"
        }]);
      }

      // Get response text first to avoid JSON parsing errors
      const responseText = await response.text();
      
      // Try to parse the response as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        return NextResponse.json([{
          "Product": "Invalid API response",
          "Price": "N/A",
          "Store": "N/A",
          "URL": "#"
        }]);
      }
      
      // Check if the response has the expected structure
      if (!result.outputs || !result.outputs["out-0"]) {
        return NextResponse.json([{
          "Product": "Unexpected API response format",
          "Price": "N/A",
          "Store": "N/A",
          "URL": "#"
        }]);
      }
      
      const outputContent = result.outputs["out-0"];
      
      // Simple approach: extract JSON array using regex
      const jsonMatch = outputContent.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      
      if (jsonMatch) {
        try {
          // Basic sanitization
          const sanitizedJson = jsonMatch[0]
            .replace(/[\u0000-\u001F]+/g, " ")
            .trim();
          
          // Parse the JSON array
          const jsonArray = JSON.parse(sanitizedJson);
          
          // Return the parsed array
          return NextResponse.json(jsonArray);
        } catch (e) {
          // If parsing fails, return a fallback response
          return NextResponse.json([{
            "Product": "Error processing results",
            "Price": "N/A",
            "Store": "N/A",
            "URL": "#"
          }]);
        }
      }
      
      // If no JSON array was found, return a fallback response
      return NextResponse.json([{
        "Product": "No results found",
        "Price": "N/A",
        "Store": "N/A",
        "URL": "#"
      }]);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle timeout errors specifically
      if (fetchError.name === 'AbortError') {
        return NextResponse.json([{
          "Product": "Search timed out - please try again",
          "Price": "N/A",
          "Store": "N/A",
          "URL": "#"
        }]);
      }
      
      // Handle other fetch errors
      return NextResponse.json([{
        "Product": "Search failed - please try again",
        "Price": "N/A",
        "Store": "N/A",
        "URL": "#"
      }]);
    }
  } catch (error) {
    // Handle any other errors
    return NextResponse.json([{
      "Product": "An error occurred",
      "Price": "N/A",
      "Store": "N/A",
      "URL": "#"
    }]);
  }
}
