"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SearchResults } from "@/components/search-results";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Script from "next/script";

// Create a client component that uses the search params
function SearchPageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lottieLoaded, setLottieLoaded] = useState(false);
  const lottieContainerRef = useRef(null);

  // Improved Lottie script loading
  useEffect(() => {
    let lottieScript = document.querySelector('script[src*="dotlottie-player"]');
    
    if (!lottieScript) {
      lottieScript = document.createElement('script');
      lottieScript.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
      lottieScript.type = "module";
      document.head.appendChild(lottieScript);
    }
    
    // Create a more reliable way to detect when the component is available
    const checkLottieLoaded = () => {
      if (customElements.get('dotlottie-player')) {
        setLottieLoaded(true);
        return true;
      }
      return false;
    };
    
    // Check immediately in case it's already loaded
    if (!checkLottieLoaded()) {
      // If not loaded, set up event listener and check periodically
      lottieScript.addEventListener('load', checkLottieLoaded);
      
      // Fallback check every 100ms for up to 3 seconds
      const interval = setInterval(() => {
        if (checkLottieLoaded()) {
          clearInterval(interval);
        }
      }, 100);
      
      // Clear interval after 3 seconds regardless
      setTimeout(() => clearInterval(interval), 3000);
    }
    
    return () => {
      if (lottieScript) {
        lottieScript.removeEventListener('load', checkLottieLoaded);
      }
    };
  }, []);

  // Create or update the Lottie player when loaded
  useEffect(() => {
    if (lottieLoaded && lottieContainerRef.current && loading) {
      // Clear the container first
      lottieContainerRef.current.innerHTML = '';
      
      // Create the player element programmatically
      const player = document.createElement('dotlottie-player');
      player.setAttribute('src', 'https://lottie.host/53c74c79-1936-4540-8747-ab1a36577f63/1dJD13XVXq.lottie');
      player.setAttribute('background', 'transparent');
      player.setAttribute('speed', '1');
      player.setAttribute('loop', '');
      player.setAttribute('autoplay', '');
      player.style.width = '300px';
      player.style.height = '300px';
      
      lottieContainerRef.current.appendChild(player);
    }
  }, [lottieLoaded, loading]);

  // Get the query from URL parameters when the page loads
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, [searchParams]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    performSearch(query);
  };

  const performSearch = async (searchQuery) => {
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
            "in-0": searchQuery
          }),
        }
      );

      const data = await response.json();

      // Process the response
      if (data.errorType || data.errorMessage) {
        throw new Error("Technical issue with the search service. Please try again later.");
      }

      if (data.outputs && data.outputs["out-0"]) {
        const outputContent = data.outputs["out-0"];
        
        // Try to extract product data
        if (Array.isArray(outputContent) && outputContent.length > 0 && outputContent[0].Product) {
          setResults(outputContent);
        } else if (typeof outputContent === 'string') {
          // Try to find a JSON array in the output
          const jsonMatch = outputContent.match(/\[\s*\{[\s\S]*?\}\s*\]/);
          if (jsonMatch) {
            try {
              const products = JSON.parse(jsonMatch[0]);
              setResults(products);
            } catch (e) {
              throw new Error("Error processing search results. Please try again.");
            }
          } else {
            setResults([{
              "Product": "No products found for: " + searchQuery,
              "Price": "Try a different search term",
              "Store": "N/A",
              "URL": "#"
            }]);
          }
        } else {
          throw new Error("Unexpected response format. Please try again later.");
        }
      } else {
        throw new Error("Search service returned an invalid response. Please try again later.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Technical issue with the search service. Please try again later.");
      setResults([]);
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
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          {lottieLoaded ? (
            <div 
              ref={lottieContainerRef}
              className="w-full max-w-md mx-auto flex justify-center"
            ></div>
          ) : (
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          )}
        </div>
      ) : (
        results.length > 0 && <SearchResults content={results} query={query} />
      )}
    </div>
  );
}

// Main page component with Suspense boundary
export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Product Search</h1>
            <div className="w-full h-12 bg-gray-200 rounded-md animate-pulse mb-6"></div>
            <div className="w-full h-64 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          </div>
        }>
          <SearchPageContent />
        </Suspense>
      </main>
      <Footer />
      
      {/* Keep this Script component for additional reliability */}
      <Script 
        src="https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs" 
        type="module"
        strategy="afterInteractive"
      />
    </div>
  );
}
