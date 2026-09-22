import { useEffect } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useBooks } from "@/lib/erp/store";
import type { BooksSnapshot } from "@/lib/erp/types";

const rootRoute = getRouteApi("__root__");

/** Hydrates village books from the root loader. Seed is server-side and idempotent. */
export function BooksBoot() {
  const loaded = rootRoute.useLoaderData();
  const hydrate = useBooks((s) => s.hydrate);
  const ready = useBooks((s) => s.ready);

  useEffect(() => {
    if (loaded.books?.ok) hydrate(loaded.books);
  }, [loaded.books, hydrate]);

  useEffect(() => {
    if (ready) return;
    if (loaded.books?.ok) return;
    void useBooks.getState().refresh();
  }, [ready, loaded.books]);

  return null;
}

export function useVillageBooks(): BooksSnapshot | null {
  const loaded = rootRoute.useLoaderData();
  const books = useBooks((s) => s.books);
  return books ?? (loaded.books?.ok ? loaded.books : null);
}
