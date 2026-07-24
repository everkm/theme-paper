import { Component, For, Show } from "solid-js";
import { getPaperConfig } from "../lib/config";
import { useTranslations } from "../lib/i18n";
import { toTransitionName } from "../lib/toTransitionName";
import { Header } from "../layout/Header";
import { Footer } from "../components/Footer";
import { PageChrome } from "../components/PageChrome";
import { Datetime } from "../components/Datetime";
import { Tag } from "../components/Tag";
import { LinkButton } from "../components/LinkButton";
import { shouldShowBreadcrumb } from "../lib/breadcrumb";
import { resolvePostDetail } from "../lib/postDetail";
import { POSTS_CONTENT_DIR } from "../lib/postsPath";
import { APP_PROSE_POST } from "../lib/proseClasses";

type PostPageProps = {
  props: PageContext;
};

export const PostPage: Component<PostPageProps> = (p) => {
  const ctx = () => p.props;
  const cfg = () => getPaperConfig(ctx());
  const t = () => useTranslations(ctx().lang);
  const post = resolvePostDetail(p.props);
  const showBack = () => cfg().features?.show_back_button !== false;
  const hasBreadcrumb = () => shouldShowBreadcrumb(ctx(), "post");
  const padMainTop = () => !showBack() && !hasBreadcrumb();

  const neighbors = post?.id
    ? everkm.post_neighbors(p.props.request_id, {
        id: post.id,
        dir: POSTS_CONTENT_DIR,
        recursive: true,
        order_by: "date",
        order_direction: "desc",
        draft: false,
      })
    : null;
  const prevPost = neighbors?.prev_id
    ? everkm.post_meta(p.props.request_id, { id: neighbors.prev_id })
    : null;
  const nextPost = neighbors?.next_id
    ? everkm.post_meta(p.props.request_id, { id: neighbors.next_id })
    : null;

  return (
    <>
      <Header ctx={ctx()} />
      <PageChrome ctx={ctx()} pageKey="post" showBack={showBack()} />
      <main
        id="main-content"
        data-layout="post"
        class={`app-layout${padMainTop() ? " mt-8" : ""}`}
      >
        <Show when={post}>
          {(item) => (
            <>
              <h1
                style={{
                  "view-transition-name": toTransitionName(
                    item().title || item().slug,
                  ),
                }}
                class="text-foreground inline-block text-3xl font-bold tracking-tight sm:text-4xl"
              >
                {item().title || item().slug}
              </h1>
              <div class="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                <Datetime
                  ctx={ctx()}
                  date={item().date}
                  updatedAt={item().updated_at}
                  size="sm"
                />
                <Show when={(item().tags?.length ?? 0) > 0}>
                  <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>{t().post.tagLabel}:</span>
                    <ul class="flex flex-wrap gap-x-2 gap-y-1">
                      <For each={item().tags ?? []}>
                        {(tag) => <Tag ctx={ctx()} tag={tag} />}
                      </For>
                    </ul>
                  </div>
                </Show>
              </div>
              <article
                id="article"
                class={APP_PROSE_POST}
                innerHTML={item().content_html ?? ""}
              />
            </>
          )}
        </Show>
      </main>
      <div data-vt-swap="post-nav">
        <Show when={prevPost || nextPost}>
          <div class="mt-auto">
            <nav class="app-layout mt-8 flex flex-col gap-6 border-t border-muted pt-4 pb-4 sm:flex-row sm:justify-between sm:gap-6">
              <Show when={prevPost}>
                {(prev) => (
                  <LinkButton
                    href={prev().url_path}
                    class="group/nav text-accent max-w-full items-start no-underline sm:max-w-[48%]"
                  >
                    <span class="flex min-w-0 flex-col gap-0.5">
                      <span class="text-muted-foreground text-xs tracking-wide">
                        {t().post.previousPost}
                      </span>
                      <span class="flex gap-1.5 decoration-dashed underline-offset-4 group-hover/nav:underline">
                        <span class="shrink-0" aria-hidden="true">
                          ←
                        </span>
                        <span class="min-w-0 break-words">{prev().title}</span>
                      </span>
                    </span>
                  </LinkButton>
                )}
              </Show>
              <Show when={nextPost}>
                {(next) => (
                  <LinkButton
                    href={next().url_path}
                    class="group/nav text-accent ml-auto max-w-full items-end no-underline sm:max-w-[48%]"
                  >
                    <span class="flex min-w-0 flex-col items-end gap-0.5">
                      <span class="text-muted-foreground text-xs tracking-wide">
                        {t().post.nextPost}
                      </span>
                      <span class="flex gap-1.5 text-end decoration-dashed underline-offset-4 group-hover/nav:underline">
                        <span class="min-w-0 break-words">{next().title}</span>
                        <span class="shrink-0" aria-hidden="true">
                          →
                        </span>
                      </span>
                    </span>
                  </LinkButton>
                )}
              </Show>
            </nav>
          </div>
        </Show>
      </div>
      <Footer
        ctx={ctx()}
        config={cfg()}
        noMarginTop={!!(prevPost || nextPost)}
      />
    </>
  );
};
