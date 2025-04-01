"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResultsProps {
  content: string;
  query: string;
}

export function SearchResults({ content, query }: SearchResultsProps) {
  // Function to parse markdown-like text and format it with React components
  const formatContent = (text: string) => {
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

          // If we're starting bold text, remember the marker
          if (isBold) {
            marker = delimiter;
            lastIndex = match.index + delimiter.length;
          } else {
            // We're ending bold text, add the bold part
            if (marker === delimiter) {
              parts.push(
                <strong key={`${index}-bold`} className="font-bold">
                  {currentText.substring(lastIndex, match.index)}
                </strong>
              );
              lastIndex = match.index + delimiter.length;
            } else {
              // Mismatched delimiters, just add as text
              parts.push(
                <span key={`${index}-text`}>
                  {marker + currentText.substring(lastIndex, match.index) + delimiter}
                </span>
              );
              lastIndex = match.index + delimiter.length;
            }
          }
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

      // Check if this is a store/price line (look for $ or price indicators)
      if (line.match(/\$\d+/) || line.match(/\d+\s*[.,-]\s*\d{2}/) || line.match(/\*\*.*\*\*/)) {
        // Check if it's a numbered item like "1. Store - $price"
        const storeMatch = line.match(/^(\d+)\.\s+\*\*([^*]+)\*\*\s*-\s*(.*)$/);
        if (storeMatch) {
          const [_, number, store, details] = storeMatch;
          return (
            <div key={index} className="flex items-start gap-2 mt-4 mb-2">
              <Badge variant="outline" className="rounded-full h-6 w-6 flex items-center justify-center p-0 text-sm bg-primary/10">
                {number}
              </Badge>
              <div>
                <strong className="font-bold">{store}</strong> - {details}
              </div>
            </div>
          );
        }

        // For other price-related lines, highlight them
        return (
          <div key={index} className="my-1 pl-4 border-l-2 border-primary">
            {line}
          </div>
        );
      }

      // Default paragraph
      return <p key={index} className="my-1">{line}</p>;
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Search Results for "{query}"
        </CardTitle>
      </CardHeader>
      <CardContent className="prose max-w-none">
        {formatContent(content)}
      </CardContent>
    </Card>
  );
}
