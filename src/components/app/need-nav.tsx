import { Link } from "@tanstack/react-router";
import { rankIntents } from "@/lib/os/intents";
import { Button } from "@/components/ui/button";
import type { BooksSnapshot } from "@/lib/erp/types";

export function NeedNav({ books }: { books?: BooksSnapshot | null }) {
  const intents = rankIntents(books).slice(0, 8);
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Need, not module</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {intents.map((i) => (
          <Button key={i.id} asChild size="sm" variant="outline" className="h-11 whitespace-nowrap">
            <Link to={i.href as never} title={i.problem}>
              {i.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
