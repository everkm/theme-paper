import { Component, For } from "solid-js";
import { getPaperConfig } from "../lib/config";
import { useTranslations } from "../lib/i18n";
import { POSTS_CONTENT_DIR, POSTS_PATH } from "../lib/postsPath";
import { readPagination } from "../lib/pagination";
import { Header } from "../layout/Header";
import { Footer } from "../components/Footer";
import { PageChrome } from "../components/PageChrome";
import { Main } from "../components/Main";
import { Card } from "../components/Card";
import { Pagination } from "../components/Pagination";

type PostsListPageProps = {
  props: PageContext;
};

export const PostsListPage: Component<PostsListPageProps> = (p) => {
  const ctx = () => p.props;
  const cfg = () => getPaperConfig(ctx());
  const t = () => useTranslations(ctx().lang);

  const all = () =>
    everkm.posts(ctx().request_id, {
      dir: POSTS_CONTENT_DIR,
      recursive: true,
      order_by: "date",
      order_direction: "desc",
      draft: false,
    });

  const pagination = () =>
    readPagination(ctx().qs ?? {}, cfg().posts?.per_page ?? 4, all().total);

  const items = () =>
    everkm.posts(ctx().request_id, {
      dir: POSTS_CONTENT_DIR,
      recursive: true,
      order_by: "date",
      order_direction: "desc",
      draft: false,
      offset: pagination().offset,
      limit: pagination().pageSize,
    }).items;

  return (
    <>
      <Header ctx={ctx()} />
      <PageChrome ctx={ctx()} pageKey="posts-list" />
      <Main
        ctx={ctx()}
        pageKey="posts-list"
        pageTitle={t().pages.postsTitle}
        pageDesc={t().pages.postsDesc}
        layout="posts-list"
      >
        <ul>
          <For each={items()}>{(post) => <Card ctx={ctx()} post={post} />}</For>
        </ul>
      </Main>
      <Pagination
        ctx={ctx()}
        pageNo={pagination().pageNo}
        pageCount={pagination().pageCount}
        basePath={POSTS_PATH}
      />
      <Footer
        ctx={ctx()}
        config={cfg()}
        noMarginTop={pagination().pageCount > 1}
      />
    </>
  );
};
