import { Component, For } from "solid-js";
import { getPaperConfig } from "../lib/config";
import { useTranslations } from "../lib/i18n";
import { Header } from "../layout/Header";
import { Footer } from "../components/Footer";
import { PageChrome } from "../components/PageChrome";
import { Main } from "../components/Main";
import { Tag } from "../components/Tag";

type TagsIndexPageProps = {
  props: PageContext;
};

export const TagsIndexPage: Component<TagsIndexPageProps> = (p) => {
  const ctx = () => p.props;
  const cfg = () => getPaperConfig(ctx());
  const t = () => useTranslations(ctx().lang);

  const tags = () =>
    everkm.posts_tag_list(ctx().request_id, {
      dir: "/posts/",
      recursive: true,
      draft: false,
    });

  const tagEntries = () =>
    Object.entries(tags()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <Header ctx={ctx()} />
      <PageChrome ctx={ctx()} pageKey="tags-index" />
      <Main
        ctx={ctx()}
        pageKey="tags-index"
        pageTitle={t().pages.tagsTitle}
        pageDesc={t().pages.tagsDesc}
        layout="tags-index"
      >
        <ul class="flex flex-wrap gap-6">
          <For each={tagEntries()}>
            {([tag, count]) => <Tag ctx={ctx()} tag={tag} count={count} />}
          </For>
        </ul>
      </Main>
      <Footer ctx={ctx()} config={cfg()} />
    </>
  );
};
