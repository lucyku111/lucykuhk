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
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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

      // Get response text first to avoid JSON parsing errors
      const responseText = await response.text();
      
      // If response is not OK, return the raw response for debugging
      if (!response.ok) {
        return NextResponse.json([{
          "Product": `API Error: ${response.status} ${response.statusText}`,
          "Price": "Raw Response:",
          "Store": responseText.substring(0, 100) + (responseText.length > 100 ? "..." : ""),
          "URL": "#"
        }], { status: 200 });
      }
      
      // Try to parse the response as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        // Return the raw response for debugging
        return NextResponse.json([{
          "Product": "JSON Parse Error",
          "Price": "Raw Response:",
          "Store": responseText.substring(0, 100) + (responseText.length > 100 ? "..." : ""),
          "URL": "#"
        }], { status: 200 });
      }
      
      // Check if the response has the expected structure
      if (!result.outputs || !result.outputs["out-0"]) {
        // Return the raw response structure for debugging
        return NextResponse.json([{
          "Product": "Invalid Response Structure",
          "Price": "Raw Response:",
          "Store": JSON.stringify(result).substring(0, 100) + "...",
          "URL": "#"
        }], { status: 200 });
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
          return NextResponse.json(jsonArray, { status: 200 });
        } catch (e) {
          // Return the matched JSON for debugging
          return NextResponse.json([{
            "Product": "JSON Parse Error in Match",
            "Price": "Matched Content:",
            "Store": jsonMatch[0].substring(0, 100) + (jsonMatch[0].length > 100 ? "..." : ""),
            "URL": "#"
          }], { status: 200 });
        }
      }
      
      // If no JSON array was found, return the raw output for debugging
      return NextResponse.json([{
        "Product": "No JSON Array Found",
        "Price": "Raw Output:",
        "Store": outputContent.substring(0, 100) + (outputContent.length > 100 ? "..." : ""),
        "URL": "#"
      }], { status: 200 });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Return detailed error information
      return NextResponse.json([{
        "Product": `Fetch Error: ${fetchError.name}`,
        "Price": `Message: ${fetchError.message}`,
        "Store": "N/A",
        "URL": "#"
      }], { status: 200 });
    }
  } catch (error) {
    // Return detailed error information
    return NextResponse.json([{
      "Product": `General Error: ${error.name || "Unknown"}`,
      "Price": `Message: ${error.message || "No message"}`,
      "Store": "N/A",
      "URL": "#"
    }], { status: 200 });
  }
}
