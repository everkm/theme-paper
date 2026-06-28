import { Component, For, Show } from "solid-js";
import { getPaperConfig } from "../lib/config";
import { useTranslations } from "../lib/i18n";
import { toTransitionName } from "../lib/toTransitionName";
import { pageUrl } from "../lib/url";
import { Header } from "../layout/Header";
import { Footer } from "../components/Footer";
import { PageChrome } from "../components/PageChrome";
import { Datetime } from "../components/Datetime";
import { Tag } from "../components/Tag";
import { LinkButton } from "../components/LinkButton";
import { shouldShowBreadcrumb } from "../lib/breadcrumb";
import { resolvePostDetail } from "../lib/postDetail";
import { APP_PROSE_POST } from "../lib/proseClasses";

type PostPageProps = {
  props: PageContext;
};

export const PostPage: Component<PostPageProps> = (p) => {
  const ctx = () => p.props;
  const cfg = () => getPaperConfig(ctx());
  const t = () => useTranslations(ctx().lang);
  const post = () => resolvePostDetail(ctx());
  const showBack = () => cfg().features?.show_back_button !== false;
  const hasBreadcrumb = () => shouldShowBreadcrumb(ctx(), "post");
  const padMainTop = () => !showBack() && !hasBreadcrumb();

  const prevPost = () => {
    const id = post()?.prev_id;
    if (!id) return null;
    return everkm.post_meta(ctx().request_id, { id });
  };

  const nextPost = () => {
    const id = post()?.next_id;
    if (!id) return null;
    return everkm.post_meta(ctx().request_id, { id });
  };

  return (
    <>
      <Header ctx={ctx()} />
      <PageChrome ctx={ctx()} pageKey="post" showBack={showBack()} />
      <main
        id="main-content"
        data-layout="post"
        data-pagefind-body=""
        class={`app-layout${padMainTop() ? " mt-8" : ""}`}
      >
        <Show when={post()}>
          {(item) => (
            <>
              <h1
                style={{
                  "view-transition-name": toTransitionName(
                    item().title || item().slug,
                  ),
                }}
                class="text-accent inline-block text-2xl font-bold sm:text-3xl"
              >
                {item().title || item().slug}
              </h1>
              <Datetime
                ctx={ctx()}
                date={item().date}
                updatedAt={item().updated_at}
                size="lg"
                class="my-2"
              />
              <Show when={(item().tags?.length ?? 0) > 0}>
                <div class="my-4 flex flex-wrap gap-2">
                  <span class="text-muted-foreground italic">
                    {t().post.tagLabel}:
                  </span>
                  <ul class="flex flex-wrap gap-2">
                    <For each={item().tags ?? []}>
                      {(tag) => <Tag ctx={ctx()} tag={tag} />}
                    </For>
                  </ul>
                </div>
              </Show>
              <article
                id="article"
                class={APP_PROSE_POST}
                innerHTML={item().content_html ?? ""}
              />
              <Show when={prevPost() || nextPost()}>
                <nav class="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Show when={prevPost()}>
                    {(prev) => (
                      <LinkButton
                        href={pageUrl(ctx().request_id, prev().url_path)}
                        class="text-accent flex w-full gap-1 decoration-dashed underline-offset-4 hover:opacity-75 hover:underline"
                      >
                        <span>← {prev().title}</span>
                      </LinkButton>
                    )}
                  </Show>
                  <Show when={nextPost()}>
                    {(next) => (
                      <LinkButton
                        href={pageUrl(ctx().request_id, next().url_path)}
                        class="text-accent flex w-full justify-end gap-1 text-end decoration-dashed underline-offset-4 hover:opacity-75 hover:underline sm:col-start-2"
                      >
                        <span>{next().title} →</span>
                      </LinkButton>
                    )}
                  </Show>
                </nav>
              </Show>
            </>
          )}
        </Show>
      </main>
      <Footer ctx={ctx()} config={cfg()} />
    </>
  );
};
