"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { supabase } from '@/lib/supabase';
import { useRouter } from "next/navigation";
import { Heart, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the type for a favorite product
interface FavoriteProduct {
  id: string;
  user_id: string;
  product_name: string;
  product_price: string;
  product_store: string;
  product_url: string;
  created_at: string;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch favorites on component mount
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Function to fetch favorites
  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      console.log("Attempting to fetch favorites for user:", user.id);
      
      // Remove the is('deleted', null) condition
      const { data, error } = await supabase
        .from('favorite_products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Supabase error details:", error);
        toast({
          title: "Error",
          description: `Failed to load favorites: ${error.message || "Unknown error"}`,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Fetched favorites successfully:", data?.length || 0, "items");
      setFavorites(data || []);
    } catch (err) {
      console.error("Exception in fetchFavorites:", err);
      // Log more details about the error
      if (err instanceof Error) {
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      } else {
        console.error("Unknown error type:", typeof err);
      }
      
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to remove a favorite (with hard delete)
  const removeFavorite = async (favorite: FavoriteProduct) => {
    try {
      // Update UI immediately for better UX
      setFavorites(prev => prev.filter(fav => 
        !(fav.product_url === favorite.product_url && fav.user_id === favorite.user_id)
      ));
      
      console.log("Attempting to delete favorite:", favorite);
      
      // Delete based on the combination of user_id and product_url (as a unique identifier)
      const { error } = await supabase
        .from('favorite_products')
        .delete()
        .match({ 
          user_id: favorite.user_id,
          product_url: favorite.product_url 
        });
      
      console.log("Delete response:", error);
      
      if (error) {
        console.error("Delete error:", error);
        // Revert UI change if delete fails
        await fetchFavorites();
        toast({
          title: "Error",
          description: `Failed to remove: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log("Successfully deleted favorite");
        toast({
          title: "Removed from favorites",
          description: "The product has been removed from your favorites.",
        });
      }
    } catch (err) {
      console.error("Error in removeFavorite:", err);
      // Revert UI change if there's an error
      await fetchFavorites();
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    // Redirect to login or show a message
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto py-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
              <p className="mb-6">You need to be signed in to view your favorite products.</p>
              <Button onClick={() => router.push('/')}>
                Go to Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              className="mr-4"
              onClick={() => router.push('/search')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Your Favorite Products</h1>
          </div>
          
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : favorites.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="divide-y">
                {favorites.map((favorite, index) => (
                  <div key={`${favorite.id}-${index}`} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{favorite.product_name}</h3>
                        <p className="text-primary font-bold">${favorite.product_price}</p>
                        <p className="text-sm text-gray-500">From: {favorite.product_store}</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(favorite.product_url, '_blank')}
                        >
                          View Product
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeFavorite(favorite)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
              <p className="text-gray-500 mb-6">You haven't added any products to your favorites.</p>
              <Button onClick={() => router.push('/search')}>
                Start Searching
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}