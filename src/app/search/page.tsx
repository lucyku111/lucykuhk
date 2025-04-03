"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchResult } from "@/lib/search";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the query parameter from the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryParam = searchParams.get("q");
    if (queryParam) {
      setQuery(queryParam);
      performSearch(queryParam);
    }
  }, []);

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    console.log(`Performing search for: ${searchQuery}`);

    try {
      // Send the search query to the API
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      console.log("API response:", data);

      // Check if the response contains an error message
      if (data.error) {
        setError(`Error: ${data.error}`);
        return;
      }

      // Set the result - could be an array of products or a string
      setResult({
        content: data,
        query: searchQuery,
      });
    } catch (err) {
      console.error("Error searching products:", err);
      setError("Failed to search for products. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    // Update the URL
    const url = new URL(window.location.href);
    url.searchParams.set("q", newQuery);
    window.history.pushState({}, "", url);
    performSearch(newQuery);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <SearchBar
            defaultValue={query}
            onSearch={handleSearch}
            className="max-w-3xl mx-auto"
          />
        </div>

        {loading && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-[250px]" />
                <Skeleton className="h-4 w-[300px]" />
                <Skeleton className="h-4 w-[250px]" />
                <div className="pt-4">
                  <Skeleton className="h-[200px] w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6 text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {!loading && !error && result && (
          <SearchResults content={result.content} query={result.query} />
        )}
      </main>
      <Footer />
    </div>
  );
}
