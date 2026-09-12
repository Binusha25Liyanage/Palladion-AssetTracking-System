/**
 * Maps an organization's slug to the CSS class that applies its theme
 * (see the CSS variable blocks in src/index.css). PALLADION has no entry —
 * it's the default look defined on :root, so "no class" already means
 * PALLADION. Add a new organization's theme here when one is built.
 */
const THEME_CLASS_BY_SLUG: Record<string, string> = {
  "lakmee-holdings": "theme-lakmee",
};

const ALL_THEME_CLASSES = Object.values(THEME_CLASS_BY_SLUG);

/**
 * Applies the CSS theme class for the given organization slug to <html>,
 * clearing any previously applied theme class first. Called from:
 * - Login.tsx, live, as the Organization dropdown changes (pre-auth preview)
 * - AuthContext, once the logged-in user's organization is known, and on logout
 */
export function applyOrgTheme(slug?: string | null) {
  const root = document.documentElement;
  root.classList.remove(...ALL_THEME_CLASSES);
  if (slug && THEME_CLASS_BY_SLUG[slug]) {
    root.classList.add(THEME_CLASS_BY_SLUG[slug]);
  }
}
