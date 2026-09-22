/** Derived work list. Classification is the TODO. Completion needs runtime. */

import { OS_ITEMS } from "./catalog.ts";
import type { OsStage, OsTodo, TodoStatus } from "./types.ts";

export function osTodos(): OsTodo[] {
  return OS_ITEMS.map((x) => ({
    id: `todo-${x.id}`,
    itemId: x.id,
    stage: x.stage,
    title: x.name,
    status: x.todo,
    why: x.missing,
    exit: x.next,
  }));
}

export function remainingWork(limit = 12): OsTodo[] {
  return osTodos()
    .filter((t) => t.status !== "done")
    .sort((a, b) => a.stage - b.stage || a.itemId.localeCompare(b.itemId))
    .slice(0, limit);
}

export function todosByStage(stage: OsStage): OsTodo[] {
  return osTodos().filter((t) => t.stage === stage);
}

export function todoCounts(status?: TodoStatus) {
  const rows = status ? osTodos().filter((t) => t.status === status) : osTodos();
  return {
    total: rows.length,
    done: rows.filter((t) => t.status === "done").length,
    open: rows.filter((t) => t.status === "open").length,
    blocked: rows.filter((t) => t.status === "blocked").length,
  };
}
