import { mockProducts } from "@/lib/products";

// This function generates the static paths for the product pages
export function generateStaticParams() {
  return mockProducts.map((product) => ({
    id: product.id,
  }));
}