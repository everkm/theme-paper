import { ParentComponent, Show } from "solid-js";
import { getPaperConfig } from "../lib/config";
import { assetUrl } from "../lib/url";

const FOUC_SCRIPT = `(function () {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored ?? (prefersDark ? "dark" : "light");
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
  window.__theme = { value: theme };
})();`;

type RootLayoutProps = {
  context: PageContext;
  title?: string;
  description?: string;
};

export const RootLayout: ParentComponent<RootLayoutProps> = (props) => {
  const ctx = () => props.context;
  const cfg = () => getPaperConfig(ctx());
  const siteName = () => cfg().site.name;
  const postMeta = () => ctx().post;
  const postTitle = () => postMeta()?.title ?? "";
  const pageTitle = () =>
    props.title ??
    (postTitle() ? `${postTitle()} | ${siteName()}` : siteName());
  const metaDesc = () =>
    props.description ??
    postMeta()?.summary ??
    cfg().site.description ??
    "";
  const baseUrl = () => everkm.base_url(ctx().request_id);
  const lang = () => ctx().lang || cfg().site.lang || "en";
  const dir = () => cfg().site.dir ?? "ltr";
  const customBodyEndHtml = () => cfg().body_end_html || "";

  return (
    <html lang={lang()} dir={dir()} class="overflow-y-scroll">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{pageTitle()}</title>
        <meta name="title" content={pageTitle()} />
        <meta name="description" content={metaDesc()} />
        <meta
          name="generator"
          content={`everkm-publish@v${ctx().everkm_publish_version}`}
        />
        <meta
          name="theme"
          content={`${ctx().theme_name}@${ctx().theme_version}`}
        />
        {/* <link
          rel="icon"
          type="image/svg+xml"
          href={assetUrl(ctx().request_id, "/assets/favicon.svg")}
        /> */}
        <script innerHTML={FOUC_SCRIPT} />
        <script
          innerHTML={`
          window.__everkm_lang = ${JSON.stringify(lang())};
          window.__everkm_base_url = ${JSON.stringify(baseUrl() + "/")};
          window.__everkm_features_view_transitions = ${JSON.stringify(cfg().features?.view_transitions !== false)};
          window.__everkm_env_is_preview = ${JSON.stringify(!!ctx().env_is_preview)};
          `}
        />
      </head>
      <body class="bg-background font-app text-foreground selection:bg-accent/75 selection:text-accent-foreground flex min-h-svh flex-col">
        {props.children}
        <Show when={!!customBodyEndHtml()}>
          <div innerHTML={customBodyEndHtml()} />
        </Show>
      </body>
    </html>
  );
};
