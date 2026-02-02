"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSearch = () => {
    if (search) {
      const params = new URLSearchParams(searchParams);
      params.set("search", search);
      router.push(`/products?${params.toString()}`, {
        scroll: false,
      });
    }
  };
  return (
    <div className="hidden sm:flex items-center gap-2 rounded-md ring-1 ring-gray-200 px-2 py-1 shadow-md">
      <Search className="w-4 h-4 text-gray-500" />
      <input
        id="search"
        placeholder="Search..."
        className="text-sm outline-0"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
    </div>
  );
};

export default SearchBar;
