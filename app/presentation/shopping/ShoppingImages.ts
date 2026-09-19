/******************************
 * ShoppingImages
 * The hero photography, kept as a plain client-side list.
 *
 * TO ADD IMAGES: upload to the public `shopping_images` bucket in Supabase,
 * then paste each public URL below. The format is
 *   https://dfzmznfuplzjgxqiluuc.supabase.co/storage/v1/object/public/shopping_images/<file>
 *
 * While the list is empty every hero falls back to a flat accent panel, so the
 * app looks deliberate rather than broken before any photo is uploaded.
 */
export const SHOPPING_IMAGES: string[] = [
  // "https://dfzmznfuplzjgxqiluuc.supabase.co/storage/v1/object/public/shopping_images/01.jpg",
];

/******************************
 * pickImage
 * A stable image for a given seed (a date, a meal id). Hashing the seed rather
 * than picking at random means the same day keeps the same photo across
 * re-renders — a Math.random() here would flicker on every state change.
 */
export function pickImage(
  seed: string,
): string | null {
  if (SHOPPING_IMAGES.length === 0) return null;

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }

  const index =
    Math.abs(hash) % SHOPPING_IMAGES.length;
  return SHOPPING_IMAGES[index];
}
