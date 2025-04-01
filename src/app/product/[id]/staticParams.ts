// Make sure this import path is correct
import { mockProducts } from "@/lib/products";

// This function generates the static paths for the product pages
export function generateStaticParams() {
  // Add a fallback in case mockProducts is undefined
  const products = mockProducts || [];
  
  return products.map((product) => ({
    id: product.id,
  }));
}