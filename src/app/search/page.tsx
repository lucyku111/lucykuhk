"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { SearchResults } from "@/components/search-results";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Script from "next/script";
import { useAuth } from "@/context/auth-context";
import { LoginModal } from "@/components/login-modal";
import { supabase } from '@/lib/supabase';

// Create a client component that uses the search params
function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lottieLoaded, setLottieLoaded] = useState(false);
  const lottieContainerRef = useRef(null);
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState([
    "iPhone 14 Pro Max",
    "MacBook Pro",
    "AirPods Pro",
    "Samsung Galaxy S23",
    "PlayStation 5"
  ]);

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

  // Function to save a search to the database
  const saveSearchToHistory = async (searchTerm) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('search_history')
        .insert([
          { 
            user_id: user.id, 
            search_term: searchTerm,
            created_at: new Date().toISOString()
          }
        ]);
        
      if (error) throw error;
      
      // After saving, refresh the recent searches and today's count
      fetchRecentSearches();
      countTodaySearches();
    } catch (err) {
      console.error("Error saving search history:", err);
    }
  };

  // Function to fetch recent searches
  const fetchRecentSearches = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);
        
      if (error) throw error;
      
      setRecentSearches(data || []);
    } catch (err) {
      console.error("Error fetching search history:", err);
    }
  };

  // Load recent searches when the component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchRecentSearches();
    }
  }, [user]);

  // Add a state for today's search count
  const [todaySearchCount, setTodaySearchCount] = useState(0);

  // Function to count today's searches
  const countTodaySearches = async () => {
    if (!user) return;
    
    try {
      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from('search_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());
        
      if (error) throw error;
      
      setTodaySearchCount(count || 0);
    } catch (err) {
      console.error("Error counting today's searches:", err);
    }
  };

  // Load today's search count when component mounts or user changes
  useEffect(() => {
    if (user) {
      countTodaySearches();
    }
  }, [user]);

  // Get the query from URL parameters when the page loads
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery && user) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    } else if (urlQuery && !user) {
      setQuery(urlQuery);
      setIsLoginModalOpen(true);
    }
  }, [searchParams, user]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    // If the input is cleared completely, also clear the results
    if (newValue === '') {
      setResults([]);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    
    performSearch(query);
  };

  const handlePopularSearch = (term) => {
    if (!user) {
      setQuery(term);
      setIsLoginModalOpen(true);
      return;
    }
    
    setQuery(term);
    performSearch(term);
  };

  const performSearch = async (searchQuery) => {
    setLoading(true);
    setError(null);

    try {
      // Save the search to history
      if (user) {
        saveSearchToHistory(searchQuery);
      }
      
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

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Find the Best Deals</h1>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-8 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Search for products..."
              value={query}
              onChange={handleInputChange}
              className="flex-1"
            />
            <Button type="submit">
              Search
            </Button>
          </form>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <Button 
                  key={term} 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePopularSearch(term)}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3 border border-blue-100">
            <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-700">Sign in required</h3>
              <p className="text-sm text-blue-600">
                Please sign in to search for products and view the best deals across multiple stores.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Search</h3>
                <p className="text-gray-600">Enter what you're looking for and let our AI find the best options.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Compare</h3>
                <p className="text-gray-600">We search across multiple stores to find the best prices and options.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Save</h3>
                <p className="text-gray-600">Get the best deal and save money on your purchases.</p>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Why Choose Us</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-medium text-lg mb-2">Save Time & Money</h3>
                <p className="text-gray-600">We search multiple stores so you don't have to, finding the best prices instantly.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-medium text-lg mb-2">Real-time Pricing</h3>
                <p className="text-gray-600">Our data is updated regularly to ensure you get accurate pricing information.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-medium text-lg mb-2">Trusted Stores Only</h3>
                <p className="text-gray-600">We only include results from reputable retailers you can trust.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-medium text-lg mb-2">Personalized Recommendations</h3>
                <p className="text-gray-600">Sign up to get personalized product recommendations based on your interests.</p>
              </div>
            </div>
          </section>
        </div>
        
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome to your Dashboard</h1>
              <p className="text-gray-600 mt-1">Hello, {user.email?.split('@')[0]}</p>
            </div>
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="flex gap-2 w-[400px]">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={query}
                  onChange={handleInputChange}
                  className="flex-1 bg-white"
                />
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Search
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 divide-x divide-y md:divide-y-0 border-t">
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">Searches Today</p>
            <p className="text-2xl font-bold mt-1">{todaySearchCount}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">Favorite Stores</p>
            <p className="text-2xl font-bold mt-1">3</p>
          </div>
        </div>
      </div>
      
      {/* Mobile Search - only visible on small screens */}
      <div className="md:hidden mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search for products..."
            value={query}
            onChange={handleInputChange}
            className="flex-1"
          />
          <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Search
          </Button>
        </form>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
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
        </div>
      )}
      
      {/* Search Results */}
      {!loading && results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {/* Comment out or remove this heading if it's duplicated in the SearchResults component */}
            {/* <h2 className="text-lg font-semibold">Results for "{query}"</h2> */}
            <h2 className="text-lg font-semibold">Search Results</h2>
            <Button variant="outline" size="sm" onClick={() => setResults([])}>
              Clear Results
            </Button>
          </div>
          <SearchResults content={results} query={query} />
        </div>
      )}
      
      {/* Quick Searches - only shown when not displaying results */}
      {!loading && results.length === 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quick Searches</h2>
            <Button variant="ghost" size="sm" className="text-primary">View All</Button>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {popularSearches.map((term) => (
              <Button 
                key={term} 
                variant="outline" 
                size="sm"
                onClick={() => handlePopularSearch(term)}
                className="rounded-full"
              >
                {term}
              </Button>
            ))}
          </div>
          
          <h3 className="text-md font-medium mb-3">Recent Searches</h3>
          <div className="space-y-2">
            {recentSearches.length > 0 ? (
              recentSearches.map((item, index) => {
                // Calculate time ago
                const searchTime = new Date(item.created_at);
                const now = new Date();
                const diffHours = Math.round((now - searchTime) / (1000 * 60 * 60));
                const timeAgo = diffHours <= 0 
                  ? 'Just now' 
                  : diffHours === 1 
                    ? '1 hour ago' 
                    : `${diffHours} hours ago`;
                    
                return (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md cursor-pointer border border-gray-100"
                    onClick={() => handlePopularSearch(item.search_term)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xs">
                        {index + 1}
                      </div>
                      <span>{item.search_term}</span>
                    </div>
                    <span className="text-xs text-gray-500">{timeAgo}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No recent searches yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense boundary
export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
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
