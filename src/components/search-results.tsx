"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingCart, Tag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';

interface ProductResult {
  Product: string;
  Price: string;
  Store: string;
  URL: string;
}

interface SearchResultsProps {
  content: string | ProductResult[];
  query: string;
  onToggleFavorite?: (product: ProductResult) => void;
}

export function SearchResults({ content, query, onToggleFavorite }: SearchResultsProps) {
  const [favoriteItems, setFavoriteItems] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Fetch the user's favorite products when the component mounts
    const fetchFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('favorite_products')
        .select('product_name')
        .eq('user_id', user.id);
      
      if (data) {
        // Create a map of product names to boolean values
        const favMap = data.reduce((acc, item) => {
          acc[item.product_name] = true;
          return acc;
        }, {} as Record<string, boolean>);
        
        setFavoriteItems(favMap);
      }
    };
    
    fetchFavorites();
  }, []);
  
  // Handle toggling favorites with local state update
  const handleToggleFavorite = (product: ProductResult) => {
    // Update local state immediately for better UX
    setFavoriteItems(prev => ({
      ...prev,
      [product.Product]: !prev[product.Product]
    }));
    
    // Call the parent component's handler
    if (onToggleFavorite) {
      onToggleFavorite(product);
    }
  };

  // Check if content is an array of product results
  const isProductArray = Array.isArray(content) && 
    content.length > 0 && 
    typeof content[0] === 'object' && 
    'Product' in content[0];

  // Render product results in a card layout
  if (isProductArray) {
    const products = content as ProductResult[];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Results for "{query}"</h2>
          <Badge variant="outline" className="px-3 py-1">
            {products.length} results
          </Badge>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <Card key={index} className="overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className="bg-muted/50 pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-2 text-base font-medium">
                    {product.Product}
                  </CardTitle>
                  {onToggleFavorite && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={favoriteItems[product.Product] ? "text-red-500" : "text-gray-400 hover:text-red-500"}
                      onClick={() => handleToggleFavorite(product)}
                    >
                      {favoriteItems[product.Product] ? (
                        <Heart className="h-5 w-5 fill-current" />
                      ) : (
                        <Heart className="h-5 w-5" />
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xl font-bold text-primary">{product.Price}</span>
                  </div>
                  <Badge variant="secondary">{product.Store}</Badge>
                </div>
                
                <Button 
                  className="w-full gap-2" 
                  asChild
                >
                  <a href={product.URL} target="_blank" rel="noopener noreferrer">
                    <ShoppingCart className="h-4 w-4" />
                    <span>View Deal</span>
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If not a product array, use the existing text formatter
  return (
    <Card>
      <CardHeader>
        <CardTitle>Results for "{query}"</CardTitle>
      </CardHeader>
      <CardContent>
        {typeof content === 'string' ? formatContent(content) : (
          <pre className="whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
        )}
      </CardContent>
    </Card>
  );

  // Function to parse markdown-like text and format it with React components
  function formatContent(text: string) {
    if (!text) return null;

    // Split the content by lines
    const lines = text.split("\n");

    // Process the lines
    return lines.map((line, index) => {
      // Skip empty lines
      if (line.trim() === "") return <React.Fragment key={index}><br /></React.Fragment>;

      // Headers (starts with # or ##)
      if (line.startsWith("# ")) {
        return <h1 key={index} className="text-2xl font-bold my-3">{line.substring(2)}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={index} className="text-xl font-bold my-2">{line.substring(3)}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={index} className="text-lg font-bold my-2">{line.substring(4)}</h3>;
      }

      // List items (starts with - or *)
      if (line.match(/^\s*[-*]\s/)) {
        return <li key={index} className="ml-6 list-disc">{line.replace(/^\s*[-*]\s/, "")}</li>;
      }

      // Numbered list items (starts with number followed by .)
      if (line.match(/^\s*\d+\.\s/)) {
        return <li key={index} className="ml-6 list-decimal">{line.replace(/^\s*\d+\.\s/, "")}</li>;
      }

      // Bold text (surrounded by ** or __)
      if (line.includes("**") || line.includes("__")) {
        const parts = [];
        const currentText = line;
        let isBold = false;
        let lastIndex = 0;
        let marker = "**";

        // Find all occurrences of ** or __
        const regex = /(\*\*|__)/g;
        let match;
        let index = 0;

        while ((match = regex.exec(currentText)) !== null) {
          const delimiter = match[0];
          // Add the text before the marker
          if (match.index > lastIndex) {
            parts.push(
              <span key={`${index}-text`}>
                {currentText.substring(lastIndex, match.index)}
              </span>
            );
          }

          // Toggle bold state
          isBold = !isBold;
          lastIndex = match.index + delimiter.length;
          index++;
        }

        // Add any remaining text
        if (lastIndex < currentText.length) {
          parts.push(
            <span key={`${index}-text`}>
              {currentText.substring(lastIndex)}
            </span>
          );
        }

        return <p key={index}>{parts}</p>;
      }

      // Regular paragraph
      return <p key={index} className="my-2">{line}</p>;
    });
  }
}
