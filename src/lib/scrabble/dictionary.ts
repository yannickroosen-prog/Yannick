// Lichtgewicht woordenboek voor woordvalidatie.
//
// Een volledig Nederlands Scrabble-woordenboek is groot; voor de MVP laden we
// optioneel een woordenlijst uit /public/dictionaries/nl.txt (één woord per
// regel). Ontbreekt die lijst, dan wordt validatie overgeslagen (valid = undefined).

import { asset } from '../paths';

let wordSet: Set<string> | null = null;
let loadPromise: Promise<Set<string> | null> | null = null;

/** Laadt de woordenlijst (idempotent). Retourneert null als er geen lijst is. */
export async function loadDictionary(
  url = asset('/dictionaries/nl.txt')
): Promise<Set<string> | null> {
  if (wordSet) return wordSet;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const text = await res.text();
      const set = new Set(
        text
          .split(/\r?\n/)
          .map((w) => w.trim().toUpperCase())
          .filter((w) => w.length > 0)
      );
      wordSet = set;
      return set;
    } catch {
      return null;
    }
  })();

  return loadPromise;
}

/** Is de woordenlijst geladen en niet-leeg? */
export function isDictionaryLoaded(): boolean {
  return wordSet !== null && wordSet.size > 0;
}

/**
 * Valideert een woord. Retourneert undefined wanneer er geen woordenlijst
 * geladen is (zodat de UI "onbekend" i.p.v. "ongeldig" kan tonen).
 */
export function validateWord(word: string): boolean | undefined {
  if (!wordSet || wordSet.size === 0) return undefined;
  return wordSet.has(word.toUpperCase());
}
