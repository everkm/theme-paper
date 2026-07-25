import { configValue } from "./configValue";

export interface PaperSiteConfig {
  name: string;
  description: string;
  author?: string;
  profile?: string;
  lang?: string;
  timezone?: string;
  dir?: string;
}

export interface PaperFeatures {
  light_and_dark_mode?: boolean;
  show_archives?: boolean;
  show_back_button?: boolean;
  view_transitions?: boolean;
  edit_post?: { enabled?: boolean; url?: string };
}

/** Extra top-nav items (default: after About; `at_before` places before Posts). */
export interface HeaderNavItem {
  title: string;
  url: string;
  /** Open in new tab; defaults to true for absolute URLs. */
  new_window?: boolean;
  /** Place before built-in nav (Posts/Tags/About); default false → after About. */
  at_before?: boolean;
}

export interface PaperConfig {
  site: PaperSiteConfig;
  home?: string;
  /** Markdown path / inner link, or absolute URL for the About nav item. */
  about?: string;
  posts?: {
    per_page?: number;
    per_index?: number;
    featured_tag?: string;
  };
  features?: PaperFeatures;
  header_nav?: HeaderNavItem[];
  socials?: { name: string; url: string }[];
  share_links?: { name: string; url: string }[];
  copyright?: { text?: string; link?: string };
  /** Custom HTML appended before `</body>` on every page. */
  body_end_html?: string;
}

const DEFAULTS: PaperConfig = {
  site: {
    name: "Paper",
    description: "",
    lang: "en",
    timezone: "UTC",
    dir: "ltr",
  },
  home: "/home.md",
  about: "/about.md",
  posts: {
    per_page: 4,
    per_index: 4,
    featured_tag: "featured",
  },
  features: {
    light_and_dark_mode: true,
    show_archives: true,
    show_back_button: true,
    view_transitions: true,
    edit_post: { enabled: false },
  },
  header_nav: [],
  socials: [],
  share_links: [],
};

function asObject(value: unknown): Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** Drop incomplete header_nav entries (missing title/url after materialize). */
function normalizeHeaderNav(items: unknown): HeaderNavItem[] {
  return asArray<Partial<HeaderNavItem>>(items).filter(
    (item): item is HeaderNavItem =>
      typeof item?.title === "string" &&
      !!item.title &&
      typeof item?.url === "string" &&
      !!item.url,
  );
}

type SocialLink = { name: string; url: string };

/**
 * `name` / `title` 可互为降级；缺 label 或 url 的项直接忽略，不抛错。
 */
function normalizeSocials(items: unknown): SocialLink[] {
  const out: SocialLink[] = [];
  for (const raw of asArray<Record<string, unknown>>(items)) {
    if (raw == null || typeof raw !== "object") continue;
    const label =
      (typeof raw.name === "string" && raw.name.trim()) ||
      (typeof raw.title === "string" && raw.title.trim()) ||
      "";
    const url = typeof raw.url === "string" ? raw.url.trim() : "";
    if (!label || !url) continue;
    out.push({ name: label, url });
  }
  return out;
}

/**
 * Theme config from `everkm.config` (i18n-materialized).
 * Do not read `ctx.config` directly.
 */
export function getPaperConfig(ctx: PageContext): PaperConfig {
  const id = ctx.request_id;
  const site = asObject(configValue(id, "site", {}));
  const posts = asObject(configValue(id, "posts", {}));
  const features = asObject(configValue(id, "features", {}));

  return {
    site: { ...DEFAULTS.site, ...site } as PaperSiteConfig,
    home: (configValue(id, "home", DEFAULTS.home) as string) ?? DEFAULTS.home,
    about:
      (configValue(id, "about", DEFAULTS.about) as string) ?? DEFAULTS.about,
    posts: { ...DEFAULTS.posts, ...posts },
    features: { ...DEFAULTS.features, ...features },
    header_nav: normalizeHeaderNav(
      configValue(id, "header_nav", DEFAULTS.header_nav),
    ),
    socials: normalizeSocials(configValue(id, "socials", DEFAULTS.socials)),
    share_links: normalizeSocials(
      configValue(id, "share_links", DEFAULTS.share_links),
    ),
    copyright: (() => {
      const raw = configValue(id, "copyright", null);
      if (raw == null) return undefined;
      return asObject(raw) as PaperConfig["copyright"];
    })(),
    body_end_html:
      (configValue(id, "body_end_html", "") as string) || undefined,
  };
}
