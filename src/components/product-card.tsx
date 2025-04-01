"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  rating: number;
  discountPercentage?: number;
  vendor?: string;
}

export function ProductCard({
  id,
  title,
  description,
  price,
  image,
  rating,
  discountPercentage,
  vendor,
}: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative">
        <Link href={`/product/${id}`}>
          <div className="aspect-square overflow-hidden">
            <Image
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-all hover:scale-105"
              width={300}
              height={300}
            />
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={toggleLike}
        >
          <Heart
            className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
          />
          <span className="sr-only">Add to favorites</span>
        </Button>
        {discountPercentage && (
          <Badge className="absolute left-2 top-2 bg-primary">
            {discountPercentage}% OFF
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        {vendor && (
          <p className="text-xs text-muted-foreground">{vendor}</p>
        )}
        <Link href={`/product/${id}`}>
          <h3 className="line-clamp-1 text-base font-semibold">{title}</h3>
        </Link>
        <p className="line-clamp-2 mt-1 text-xs text-muted-foreground">
          {description}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < rating
                    ? "text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="text-md font-bold">${price}</div>
        <Button size="sm" className="gap-1">
          <ShoppingCart className="h-4 w-4" />
          <span>Add</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
