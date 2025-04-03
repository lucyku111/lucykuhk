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

    // Use a consistent timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // Reduced timeout

    try {
      // Add retry logic for the API call
      let retries = 2;
      let response = null;
      let lastError = null;

      while (retries >= 0) {
        try {
          response = await fetch(
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
          
          if (response.ok) break;
          lastError = new Error(`API responded with status: ${response.status}`);
          retries--;
          
          // Wait before retrying
          if (retries >= 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (e) {
          lastError = e;
          retries--;
          if (retries >= 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      clearTimeout(timeoutId);

      if (!response || !response.ok) {
        return NextResponse.json([{
          "Product": `Search error: ${lastError?.message || "Server error"}`,
          "Price": "N/A",
          "Store": "N/A",
          "URL": "#"
        }]);
      }

      const result = await response.json();
      
      if (!result.outputs || !result.outputs["out-0"]) {
        return NextResponse.json([{
          "Product": "Invalid API response format",
          "Price": "N/A",
          "Store": "N/A",
          "URL": "#"
        }]);
      }
      
      const outputContent = result.outputs["out-0"];
      
      // Try multiple parsing strategies
      try {
        // First try: direct JSON parse if it's already JSON
        try {
          if (typeof outputContent === 'object') {
            return NextResponse.json(outputContent);
          }
        } catch (e) {
          // Continue to next strategy
        }
        
        // Second try: regex match for JSON array
        const jsonMatch = outputContent.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if (jsonMatch) {
          const sanitizedJson = jsonMatch[0].replace(/[\u0000-\u001F]+/g, " ").trim();
          const jsonArray = JSON.parse(sanitizedJson);
          return NextResponse.json(jsonArray);
        }
        
        // Third try: broader regex match
        const fallbackMatch = outputContent.match(/\[[\s\S]*\]/);
        if (fallbackMatch) {
          const sanitized = fallbackMatch[0]
            .replace(/[\u0000-\u001F]+/g, " ")
            .replace(/,\s*\]/g, "]")
            .replace(/,\s*,/g, ",")
            .trim();
          const jsonArray = JSON.parse(sanitized);
          return NextResponse.json(jsonArray);
        }
        
        // If we get here, no parsing strategy worked
        return NextResponse.json([{
          "Product": "Could not parse search results",
          "Price": "N/A",
          "Store": "N/A",
          "URL": "#"
        }]);
      } catch (parsingError) {
        return NextResponse.json([{
          "Product": "Error parsing results",
          "Price": "N/A",
          "Store": "N/A",
          "URL": "#"
        }]);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      return NextResponse.json([{
        "Product": fetchError.name === 'AbortError' ? "Search timeout - please try again" : `Search error: ${fetchError.message || "Unknown error"}`,
        "Price": "N/A",
        "Store": "N/A",
        "URL": "#"
      }]);
    }
  } catch (error) {
    return NextResponse.json([{
      "Product": "Error occurred - please try again later",
      "Price": "N/A",
      "Store": "N/A",
      "URL": "#"
    }]);
  }
}
