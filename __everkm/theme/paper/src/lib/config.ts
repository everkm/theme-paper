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
  search?: "pagefind" | false;
  view_transitions?: boolean;
  edit_post?: { enabled?: boolean; url?: string };
}

export interface PaperConfig {
  site: PaperSiteConfig;
  home?: string;
  about?: string;
  posts?: {
    per_page?: number;
    per_index?: number;
    featured_tag?: string;
  };
  features?: PaperFeatures;
  socials?: { name: string; url: string }[];
  share_links?: { name: string; url: string }[];
  copyright?: { text?: string; link?: string };
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
    search: "pagefind",
    view_transitions: true,
    edit_post: { enabled: false },
  },
  socials: [],
  share_links: [],
};

export function getPaperConfig(ctx: PageContext): PaperConfig {
  const raw = (ctx.config || {}) as Partial<PaperConfig>;
  return {
    ...DEFAULTS,
    ...raw,
    site: { ...DEFAULTS.site, ...raw.site },
    posts: { ...DEFAULTS.posts, ...raw.posts },
    features: { ...DEFAULTS.features, ...raw.features },
    socials: raw.socials ?? DEFAULTS.socials,
    share_links: raw.share_links ?? DEFAULTS.share_links,
  };
}
