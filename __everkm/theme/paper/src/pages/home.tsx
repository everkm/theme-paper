import { Component, For, Show } from "solid-js";
import { getPaperConfig } from "../lib/config";
import { useTranslations } from "../lib/i18n";
import { POSTS_CONTENT_DIR, POSTS_INDEX_URL } from "../lib/postsPath";
import { pageUrl } from "../lib/url";
import { APP_PROSE } from "../lib/proseClasses";
import { Header } from "../layout/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/Card";
import { LinkButton } from "../components/LinkButton";
import { Socials } from "../components/Socials";
import { Icon } from "../components/Icon";
import IconArrowRight from "../assets/icons/IconArrowRight.svg";

type HomePageProps = {
  props: PageContext;
};

export const HomePage: Component<HomePageProps> = (p) => {
  const ctx = () => p.props;
  const cfg = () => getPaperConfig(ctx());
  const t = () => useTranslations(ctx().lang);
  const featuredTag = () => cfg().posts?.featured_tag ?? "featured";
  const perIndex = () => cfg().posts?.per_index ?? 4;
  const homePath = cfg().home ?? "/home.md";

  const heroPost = everkm.post_detail(p.props.request_id, {
    path: homePath,
    allow_missing: true,
  });
  const heroHtml = heroPost?.content_html ?? "";

  const featured = () =>
    everkm.posts(ctx().request_id, {
      tags: [featuredTag()],
      limit: 6,
      order_by: "date",
      order_direction: "desc",
      draft: false,
    }).items;

  const recent = () =>
    everkm.posts(ctx().request_id, {
      dir: POSTS_CONTENT_DIR,
      recursive: true,
      exclude_tags: [featuredTag()],
      limit: perIndex(),
      order_by: "date",
      order_direction: "desc",
      draft: false,
    }).items;

  return (
    <>
      <Header ctx={ctx()} />
      <main
        id="main-content"
        data-layout="home"
        data-home-path={pageUrl(ctx().request_id, "/index.html")}
        class="app-layout"
      >
        <section id="hero" class="border-border border-b pt-8 pb-6">
          <h1 class="mb-4 inline-block text-4xl font-bold sm:mb-8 sm:text-5xl">
            {cfg().site.name}
          </h1>
          <Show when={!!cfg().site.description}>
            <p>{cfg().site.description}</p>
          </Show>
          <Show when={!!heroHtml}>
            <div class={`${APP_PROSE} mt-4`} innerHTML={heroHtml} />
          </Show>
          <Show when={(cfg().socials?.length ?? 0) > 0}>
            <div class="mt-4 flex max-sm:flex-col sm:items-center">
              <div class="me-2 mb-1 whitespace-nowrap sm:mb-0">
                {t().home.socialLinks}:
              </div>
              <Socials ctx={ctx()} socials={cfg().socials ?? []} />
            </div>
          </Show>
        </section>

        <Show when={featured().length > 0}>
          <section
            id="featured"
            class={`pt-12 pb-6 ${recent().length > 0 ? "border-border border-b" : ""}`}
          >
            <h2 class="text-2xl font-semibold tracking-wide">
              {t().home.featured}
            </h2>
            <ul>
              <For each={featured()}>
                {(post) => (
                  <Card ctx={ctx()} post={post} variant="h3" />
                )}
              </For>
            </ul>
          </section>
        </Show>

        <Show when={recent().length > 0}>
          <section id="recent-posts" class="pt-12 pb-6">
            <h2 class="text-2xl font-semibold tracking-wide">
              {t().home.recentPosts}
            </h2>
            <ul>
              <For each={recent()}>
                {(post) => (
                  <Card ctx={ctx()} post={post} variant="h3" />
                )}
              </For>
            </ul>
          </section>
        </Show>

        <div class="my-8 text-center">
          <LinkButton href={pageUrl(ctx().request_id, POSTS_INDEX_URL)}>
            {t().home.allPosts}
            <Icon svg={IconArrowRight} class="inline-block rtl:-rotate-180" />
          </LinkButton>
        </div>
      </main>
      <Footer ctx={ctx()} config={cfg()} />
    </>
  );
};
