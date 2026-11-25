// One Line Office Jokes — deterministic single-line joke writer.
//
// The program assembles one joke from a fixed set of fragments, picks the
// combination with a tiny seeded chooser (no randomness, no clock, no I/O
// beyond the output file), validates it against the competition gate
// (1..199 UTF-8 chars, a single line, not only whitespace) and writes it
// to /output/entry.txt with no trailing newline, so the file is exactly
// one line.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const OUTPUT = "/output/entry.txt";

// --- Joke fragments -------------------------------------------------------
// Each setup names a real office detail; each punch lands in the last few
// words, so the turn arrives on the final beat.

const SETUPS = [
  "Our office printer has never jammed on a document that wasn't marked urgent",
  "The reply-all thread about the broken coffee machine is now longer than the employee handbook",
  "My calendar says the Monday meeting is only thirty minutes",
];

const PUNCHES = [
  "I'm starting to think it can read.",
  "and somehow nobody has fixed either one.",
  "which is exactly how long it takes everyone to realise nobody read the agenda.",
];

// --- Tiny deterministic chooser -------------------------------------------
// A fixed seed, mixed once, so the choice is stable across runs and
// machines. No Math.random, no Date, nothing environment-dependent.

function pickIndex(seed: number, count: number): number {
  let x = seed >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) % count;
}

function buildJoke(): string {
  const seed = 42; // fixed seed: selects pair 0, the printer joke, whose
  // punch ("it can read") lands hardest in the last few words.
  const setup = SETUPS[pickIndex(seed, SETUPS.length)];
  // The punch is paired to its setup by the same seed, so the joke always
  // reads as one coherent line instead of a random mash-up.
  const punch = PUNCHES[pickIndex(seed, PUNCHES.length)];
  return `${setup} — ${punch}`;
}

// --- Gate check ------------------------------------------------------------

function gate(text: string): void {
  if (!text || !text.trim()) throw new Error("entry is empty or only whitespace");
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  const chars = [...text].length;
  if (chars < 1 || chars > 199) {
    throw new Error(`entry is ${chars} characters, must be 1..199`);
  }
}

// --- Main ------------------------------------------------------------------

const joke = buildJoke();
gate(joke);
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, joke, "utf8");
console.log(joke);
