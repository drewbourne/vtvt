"use client";

import { SearchField } from "@/ui/input/SearchField";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export function InstrumentSearch() {
  const searchParams = useSearchParams();

  const pathname = usePathname();
  const { replace } = useRouter();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("instrumentSearchTerm", term);
    } else {
      params.delete("instrumentSearchTerm");
    }

    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <SearchField
      label="Search Instruments"
      defaultValue={searchParams.get("query")?.toString()}
      onSearch={handleSearch}
    />
  );
}
