"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductResult {
  Product: string;
  Price: string;
  Store: string;
  URL: string;
}

interface SearchResultsProps {
  content: string | ProductResult[];
  query: string;
}

export function SearchResults({ content, query }: SearchResultsProps) {
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
                <CardTitle className="line-clamp-2 text-base font-medium">
                  {product.Product}
                </CardTitle>
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
