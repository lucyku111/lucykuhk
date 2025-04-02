"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Heart, Share, ShoppingCart, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { type Product, mockProducts } from "@/lib/products";

export function ProductClientPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);

      try {
        const productId = params.id as string;
        const foundProduct = mockProducts.find((p) => p.id === productId);

        if (!foundProduct) {
          setError("Product not found");
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        setProduct(foundProduct);

        const related = mockProducts
          .filter(
            (p) =>
              p.id !== productId &&
              p.category === foundProduct.category
          )
          .slice(0, 3);

        setRelatedProducts(related);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params.id]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container">
            <div className="mb-6">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="space-y-6">
                <div>
                  <Skeleton className="mb-2 h-8 w-3/4" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
                <Skeleton className="h-6 w-1/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-32 text-center">
            <h1 className="mb-6 text-2xl font-bold">
              {error || "Product not found"}
            </h1>
            <p className="mb-8 text-muted-foreground">
              We couldn't find the product you're looking for. It might have been removed or is currently unavailable.
            </p>
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <Link
            href="/search"
            className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to results
          </Link>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-lg border bg-background">
              <div className="aspect-square w-full">
                <Image
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-cover"
                  width={600}
                  height={600}
                  priority
                />
              </div>
              {product.discountPercentage && (
                <Badge className="absolute left-3 top-3 bg-primary">
                  {product.discountPercentage}% OFF
                </Badge>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">{product.title}</h1>
                {product.vendor && (
                  <p className="text-sm text-muted-foreground">By {product.vendor}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={`star-${i}`}
                      className={`h-5 w-5 ${
                        i < product.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200 dark:fill-gray-800 dark:text-gray-800"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating.toFixed(1)}
                </span>
              </div>

              <div className="text-3xl font-bold">${product.price}</div>

              <p className="text-muted-foreground">{product.description}</p>

              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-md border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.category && `Category: ${product.category}`}
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="flex-1 gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <Tabs defaultValue="description">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-6">
                <div className="prose max-w-none dark:prose-invert">
                  <h3>About this item</h3>
                  <p>{product.description}</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                    quam velit, vulputate eu pharetra nec, mattis ac neque. Duis
                    vulputate commodo lectus, ac blandit elit tincidunt id.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="specifications" className="mt-6">
                <div className="prose max-w-none dark:prose-invert">
                  <h3>Product Specifications</h3>
                  <ul>
                    <li>Brand: {product.vendor || "Unknown"}</li>
                    <li>Category: {product.category || "Miscellaneous"}</li>
                    <li>Rating: {product.rating} out of 5</li>
                    <li>Color: Various</li>
                    <li>Material: Premium quality</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-6">
                <div className="prose max-w-none dark:prose-invert">
                  <h3>Customer Reviews</h3>
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} {...relatedProduct} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}