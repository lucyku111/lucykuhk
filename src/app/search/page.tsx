// Separate client-side logic into a different component
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchResults } from "@/components/search-results";
import { type SearchResult, mockSearchResult } from "@/lib/search";
import { generateStaticParams } from "./staticParams";

// Remove DarkModeToggle import
// import { DarkModeToggle } from "@/components/DarkModeToggle";

export const dynamic = 'force-static';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
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
    console.log(`Performing search for: ${searchQuery}`); // Debugging log

    try {
      // Send the search query to the API
      const response = await fetch(
        "https://api.stack-ai.com/inference/v0/run/90d983fc-f852-4d72-b781-f93fb22f6c84/67e6048393d5490f2d932e58",
        {
          headers: {
            Authorization: "Bearer 7963ab82-f620-4f3f-9ef4-02a66a58c222",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            user_id: "anonymous", // Replace with actual user ID if available
            "in-0": searchQuery,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data); // Debugging log

      // Extract the relevant content from the API response
      const outputContent = data.outputs["out-0"];

      // Display the extracted content
      setResult({
        content: outputContent,
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
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl mb-4">
              Search Results
            </h1>
          </div>
          <SearchBar defaultValue={query} onSearch={handleSearch} />
          
          {/* Display loading state */}
          {loading && (
            <div className="mt-8 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {/* Display error message */}
          {error && (
            <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          {/* Display search results */}
          {!loading && !error && result && (
            <div className="mt-8">
              <SearchResults content={result.content} query={result.query} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
