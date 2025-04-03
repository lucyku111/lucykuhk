import { NextRequest, NextResponse } from "next/server";
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

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

    try {
      // Use curl command instead of fetch
      const userId = request.headers.get("x-forwarded-for") || "anonymous";
      const curlCommand = `curl "https://api.stack-ai.com/inference/v0/run/90d983fc-f852-4d72-b781-f93fb22f6c84/67e6048393d5490f2d932e58" -X POST -d "{\\"user_id\\": \\"${userId}\\", \\"in-0\\": \\"${query}\\"}" -H "Content-Type: application/json" -H "Authorization: Bearer 7963ab82-f620-4f3f-9ef4-02a66a58c222"`;
      
      // Execute the curl command with a timeout
      const { stdout, stderr } = await execPromise(curlCommand, { timeout: 20000 });
      
      if (stderr) {
        console.error('Curl error:', stderr);
        return NextResponse.json([{
          "Product": "Curl Error",
          "Price": "Error details:",
          "Store": stderr.substring(0, 100) + (stderr.length > 100 ? "..." : ""),
          "URL": "#"
        }], { status: 200 });
      }
      
      // Try to parse the response as JSON
      let result;
      try {
        result = JSON.parse(stdout);
      } catch (e) {
        return NextResponse.json([{
          "Product": "JSON Parse Error",
          "Price": "Raw Response:",
          "Store": stdout.substring(0, 100) + (stdout.length > 100 ? "..." : ""),
          "URL": "#"
        }], { status: 200 });
      }
      
      // Check if the response has the expected structure
      if (!result.outputs || !result.outputs["out-0"]) {
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
    } catch (execError) {
      // Handle execution errors
      return NextResponse.json([{
        "Product": `Execution Error: ${execError.name || "Unknown"}`,
        "Price": `Message: ${execError.message || "No message"}`,
        "Store": "Command timed out or failed",
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
