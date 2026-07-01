import { renderToStringAsync } from "solid-js/web";
import { RootLayout } from "../layout/RootLayout";
import { resolvePageKey } from "../lib/normalizeTplPath";
import { getPaperConfig } from "../lib/config";
import { HomePage } from "./home";
import { AboutPage } from "./about";
import { PostPage } from "./post";
import { PostsListPage } from "./posts-list";
import { TagsIndexPage } from "./tags-index";
import { TagPostsPage } from "./tag-posts";
import { ArchivesPage } from "./archives";
import { SearchPage } from "./search";

function renderPageBody(pageKey: string, props: PageContext) {
  switch (pageKey) {
    case "home":
      return <HomePage props={props} />;
    case "about":
      return <AboutPage props={props} />;
    case "post":
      return <PostPage props={props} />;
    case "posts-list":
      return <PostsListPage props={props} />;
    case "tags-index":
      return <TagsIndexPage props={props} />;
    case "tag-posts":
      return <TagPostsPage props={props} />;
    case "archives":
      return <ArchivesPage props={props} />;
    case "search":
      return <SearchPage props={props} />;
    default:
      throw new Error(`Page ${pageKey} not found (compName=${props.tpl_path})`);
  }
}

function resolveLayoutTitle(
  pageKey: string,
  props: PageContext,
  cfg: ReturnType<typeof getPaperConfig>,
): string | undefined {
  const siteName = cfg.site.name;
  if (pageKey === "home") {
    return siteName;
  }
  if (pageKey === "about") {
    const aboutPath = cfg.about ?? "/about.md";
    const aboutMeta = everkm.post_meta(props.request_id, {
      path: aboutPath,
      allow_missing: true,
    });
    const aboutTitle = aboutMeta?.title;
    return aboutTitle ? `${aboutTitle} | ${siteName}` : undefined;
  }
  return undefined;
}

async function renderPage(compName: string, props: PageContext) {
  const pageKey = resolvePageKey(compName, props.tpl_path, props.post);
  const cfg = getPaperConfig(props);
  const title = resolveLayoutTitle(pageKey, props, cfg);

  const html = await renderToStringAsync(() => (
    <RootLayout context={props} title={title}>
      {renderPageBody(pageKey, props)}
    </RootLayout>
  ));

  const cssPaper =
    everkm.assets(props.request_id, { type: "css", section: "paper" }) || "";
  const jsPaper =
    everkm.assets(props.request_id, { type: "js", section: "paper" }) || "";

  const withCss = html.replace(/<\/head>/i, `${cssPaper}</head>`);
  const withJs = withCss.replace(/<\/body>/i, `${jsPaper}</body>`);
  return `<!DOCTYPE html>${withJs}`;
}

export { renderPage };
