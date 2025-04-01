export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  rating: number;
  discountPercentage?: number;
  vendor?: string;
  category?: string;
}

export interface SearchResult {
  content: string;
  query: string;
}

export async function searchProducts(query: string): Promise<SearchResult> {
  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Return the text response from the API
    return {
      content: data,
      query: query
    };
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
}

// Mock data for development and testing
export const mockProducts: Product[] = [
  {
    id: "1",
    title: "iPhone 14 Pro Max",
    description: "Apple's latest flagship smartphone with A16 Bionic chip, 6.7-inch Super Retina XDR display, and amazing camera system.",
    price: "1099.00",
    image: "https://images.unsplash.com/photo-1696446478287-496b5a80fe80?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aXBob25lJTIwMTQlMjBwcm8lMjBtYXh8ZW58MHx8MHx8fDA%3D",
    rating: 4.8,
    discountPercentage: 5,
    vendor: "Apple",
    category: "Electronics"
  },
  {
    id: "2",
    title: "MacBook Pro 16-inch",
    description: "Powerful laptop with M2 Pro or M2 Max chip, stunning Liquid Retina XDR display, and all-day battery life.",
    price: "2499.00",
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFjYm9vayUyMHByb3xlbnwwfHwwfHx8MA%3D%3D",
    rating: 4.9,
    vendor: "Apple",
    category: "Electronics"
  },
  {
    id: "3",
    title: "Samsung Galaxy S23 Ultra",
    description: "Premium Android smartphone with 200MP camera, S Pen, and powerful Snapdragon processor.",
    price: "1199.00",
    image: "https://images.unsplash.com/photo-1678911870695-b1165aebc011?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHNhbXN1bmclMjBnYWxheHklMjBzMjMlMjB1bHRyYXxlbnwwfHwwfHx8MA%3D%3D",
    rating: 4.7,
    discountPercentage: 10,
    vendor: "Samsung",
    category: "Electronics"
  },
  {
    id: "4",
    title: "Sony WH-1000XM5",
    description: "Industry-leading noise cancelling headphones with exceptional sound quality and comfort.",
    price: "399.00",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c29ueSUyMGhlYWRwaG9uZXN8ZW58MHx8MHx8fDA%3D",
    rating: 4.6,
    vendor: "Sony",
    category: "Audio"
  },
  {
    id: "5",
    title: "iPad Pro 12.9-inch",
    description: "The ultimate iPad experience with M2 chip, Liquid Retina XDR display, and Apple Pencil support.",
    price: "1099.00",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aXBhZCUyMHByb3xlbnwwfHwwfHx8MA%3D%3D",
    rating: 4.8,
    vendor: "Apple",
    category: "Electronics"
  },
  {
    id: "6",
    title: "Canon EOS R5",
    description: "Professional-grade mirrorless camera with 45MP sensor, 8K video, and advanced autofocus.",
    price: "3899.00",
    image: "https://images.unsplash.com/photo-1599762470805-907f95ad8ff6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2Fub24lMjBjYW1lcmF8ZW58MHx8MHx8fDA%3D",
    rating: 4.9,
    discountPercentage: 8,
    vendor: "Canon",
    category: "Photography"
  }
];

// Mock search result for development
export const mockSearchResult: SearchResult = {
  query: "iPhone 14 Pro Max",
  content: `Here are the best places to buy iPhone 14 Pro Max:

1. **Apple Store** - $999 (128GB), $1099 (256GB), $1299 (512GB), $1499 (1TB)
   - Free shipping
   - 14-day return policy
   - Apple Care+ available

2. **Best Buy** - $949 (128GB), $1049 (256GB), $1249 (512GB), $1449 (1TB)
   - $50 discount with trade-in
   - Store pickup available
   - 15-day return policy

3. **Amazon** - $929 (128GB), $1029 (256GB), $1229 (512GB), $1429 (1TB)
   - Free Prime shipping
   - Various colors available
   - Different payment options

4. **Walmart** - $939 (128GB), $1039 (256GB), $1239 (512GB), $1439 (1TB)
   - Walmart+ members get 5% cashback
   - Extended warranty available
   - Free 2-day shipping on orders over $35

5. **Target** - $949 (128GB), $1049 (256GB), $1249 (512GB), $1449 (1TB)
   - 5% off with RedCard
   - Free shipping on orders over $35
   - Extended returns with RedCard

6. **T-Mobile** - $999 (128GB), $1099 (256GB), $1299 (512GB), $1499 (1TB)
   - Up to $800 off with trade-in and new line
   - Monthly payment plans available
   - 5G service included

7. **Verizon** - $999 (128GB), $1099 (256GB), $1299 (512GB), $1499 (1TB)
   - Up to $1000 off with eligible trade-in
   - Contract and unlocked options
   - Free shipping

8. **AT&T** - $999 (128GB), $1099 (256GB), $1299 (512GB), $1499 (1TB)
   - Up to $700 off with eligible trade-in
   - 36-month payment plans available
   - Free same-day delivery in select areas

Best deal: Amazon has the lowest price at $929 for the 128GB model, saving you $70 compared to retail price.`
};
