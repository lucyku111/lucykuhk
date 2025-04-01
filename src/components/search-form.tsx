"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/search-bar";

export function SearchForm() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return <SearchBar onSearch={handleSearch} />;
}
