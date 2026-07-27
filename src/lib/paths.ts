// Basis-pad-helper zodat absolute asset-URL's (model, woordenlijst, service
// worker, manifest) zowel op de root als onder een submap (GitHub Pages) werken.

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Voegt het basis-pad toe aan een absoluut pad ("/x" -> "/Yannick/x"). */
export function asset(path: string): string {
  if (!path.startsWith('/')) return path;
  return `${BASE_PATH}${path}`;
}
