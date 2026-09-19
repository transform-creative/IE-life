/******************************
 * BrandConfig
 *
 * Single source of truth for project-level copy shown to users (site name,
 * headings, footer text). Read once in `root.tsx` and surfaced everywhere via
 * `context.brandConfig` — never hardcode these strings in a component.
 */

export type BrandCopy = {
  site_name: string;
  origin_site: string;
  home_heading: string;
  home_subheading: string;
  footer_copyright: string;
};

const IE_LIFE: BrandCopy = {
  site_name: "IE Life",
  origin_site: "ie_life",
  home_heading: "IE Life",
  home_subheading: "Running the house, together.",
  footer_copyright: `© IE Life ${new Date().getFullYear()}`,
};

/*****************************
 * getBrandConfig — resolve the active brand.
 * Single-brand project; kept as a function so `root.tsx` has one call site if
 * that ever changes.
 */
export function getBrandConfig(): BrandCopy {
  return IE_LIFE;
}
