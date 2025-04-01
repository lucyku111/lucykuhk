import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchForm } from "@/components/search-form";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/30 via-primary/10 to-background">
          <div className="container flex flex-col items-center py-24 text-center md:py-32">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              Find where to buy <span className="text-primary">anything</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              IN NEED helps you discover the best places to buy any product. Get price comparisons, deals, and detailed information instantly.
            </p>
            <div className="mt-10 w-full max-w-2xl">
              <SearchForm />
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Button variant="outline" className="text-xs" asChild>
                <Link href="/search?q=iphone%2014%20pro%20max">iPhone 14 Pro Max</Link>
              </Button>
              <Button variant="outline" className="text-xs" asChild>
                <Link href="/search?q=macbook%20pro">MacBook Pro</Link>
              </Button>
              <Button variant="outline" className="text-xs" asChild>
                <Link href="/search?q=airpods%20pro">AirPods Pro</Link>
              </Button>
              <Button variant="outline" className="text-xs" asChild>
                <Link href="/search?q=playstation%205">PlayStation 5</Link>
              </Button>
              <Button variant="outline" className="text-xs" asChild>
                <Link href="/search?q=samsung%20galaxy%20s23">Samsung Galaxy S23</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container py-16">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight md:text-3xl">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Search for a Product</h3>
              <p className="text-sm text-muted-foreground">
                Simply type in any product you're looking for. The more specific, the better results you'll get.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-9 11-9 11s-9-5-9-11z" />
                  <circle cx="12.5" cy="8.5" r="2.5" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">View Store Options</h3>
              <p className="text-sm text-muted-foreground">
                Get a comprehensive list of retailers that sell your product, along with pricing information and special deals.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Find the Best Deal</h3>
              <p className="text-sm text-muted-foreground">
                Compare prices, shipping options, and special offers to find the best deal that fits your needs.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-muted py-16">
          <div className="container">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight md:text-3xl">
              Why Choose IN NEED
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold">Save Money</h3>
                <p className="text-sm text-muted-foreground">
                  Find the lowest prices across multiple retailers instantly.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold">Save Time</h3>
                <p className="text-sm text-muted-foreground">
                  No more browsing multiple sites to compare prices and options.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold">Smart AI Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes prices, deals, and shipping to highlight the best options.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold">Up-to-Date Information</h3>
                <p className="text-sm text-muted-foreground">
                  Get the latest pricing and availability information in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
