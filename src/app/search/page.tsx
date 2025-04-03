"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Direct API call to Stack AI from the client side
      const response = await fetch(
        "https://api.stack-ai.com/inference/v0/run/a346ade7-c4ef-4997-8aab-c96c2d88f56f/67ee23605586884182ffb38d",
        {
          method: "POST",
          headers: {
            "Authorization": "Bearer 7362ca54-76ff-43b2-b705-e50015e54d15",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "user_id": "anonymous-user",
            "in-0": query
          }),
        }
      );

      const data = await response.json();

      // Process the response
      if (data.errorType || data.errorMessage) {
        throw new Error(data.errorMessage || "Search failed");
      }

      if (data.outputs && data.outputs["out-0"]) {
        const outputContent = data.outputs["out-0"];
        
        // Try to extract product data
        if (Array.isArray(outputContent) && outputContent.length > 0 && outputContent[0].Product) {
          setResults(outputContent);
        } else {
          // Try to find a JSON array in the output
          const jsonMatch = outputContent.match(/\[\s*\{[\s\S]*?\}\s*\]/);
          if (jsonMatch) {
            try {
              const products = JSON.parse(jsonMatch[0]);
              setResults(products);
            } catch (e) {
              setResults([{
                "Product": "Error processing results",
                "Price": "Please try again",
                "Store": "N/A",
                "URL": "#"
              }]);
            }
          } else {
            setResults([{
              "Product": "No products found",
              "Price": "Try a different search term",
              "Store": "N/A",
              "URL": "#"
            }]);
          }
        }
      } else {
        setResults([{
          "Product": "Unexpected response format",
          "Price": "Please try again later",
          "Store": "N/A",
          "URL": "#"
        }]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Search failed");
      setResults([{
        "Product": "Search error",
        "Price": "Please try again later",
        "Store": err.message || "Unknown error",
        "URL": "#"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Product Search</h1>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Search
        </Button>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((product, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <h3 className="font-bold">{product.Product}</h3>
              <p className="text-lg font-semibold text-green-600">{product.Price}</p>
              <p className="text-gray-600">Store: {product.Store}</p>
              {product.URL && product.URL !== "#" ? (
                <a 
                  href={product.URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  View Product
                </a>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
