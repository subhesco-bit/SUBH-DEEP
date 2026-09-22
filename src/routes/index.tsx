import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { BooksHome } from "@/components/erp/books-home";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <BooksHome />
      </main>
    </Shell>
  );
}
