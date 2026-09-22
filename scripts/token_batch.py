#!/usr/bin/env python3
"""Batch token estimate. Same 4-char rule as the organism kernel. No OpenAI."""

from __future__ import annotations

import json
import sys


def estimate_tokens(text: str) -> int:
    if not text:
        return 0
    return (len(text) + 3) // 4


def batch_save(naive: str, envelopes: list[str]) -> dict:
    naive_tok = estimate_tokens(naive)
    compact = sum(estimate_tokens(e) for e in envelopes)
    batch_naive = naive_tok * max(len(envelopes), 1)
    saved = 0.0 if batch_naive == 0 else round((batch_naive - compact) / batch_naive * 1000) / 10
    return {
        "naiveTokens": naive_tok,
        "batchNaiveTokens": batch_naive,
        "batchCompactTokens": compact,
        "batchSavedPct": saved,
        "llmCalls": 0,
        "n": len(envelopes),
    }


def main() -> int:
    raw = sys.stdin.read() if not sys.argv[1:] else open(sys.argv[1], encoding="utf-8").read()
    if not raw.strip():
        # Self-check: 1000-char dump vs 5-char envelope × 19.
        naive = "x" * 1000
        envs = ["lot"] * 19
        print(json.dumps(batch_save(naive, envs)))
        return 0
    data = json.loads(raw)
    print(json.dumps(batch_save(data["naive"], data["envelopes"])))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
