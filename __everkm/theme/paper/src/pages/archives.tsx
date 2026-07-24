import { Component, For } from "solid-js";
import dayjs from "dayjs";
import { getPaperConfig } from "../lib/config";
import { dayjsLocale } from "../lib/dayjsLocale";
import { POSTS_CONTENT_DIR } from "../lib/postsPath";
import { postDate, postTimestampSeconds } from "../lib/postDate";
import { useTranslations } from "../lib/i18n";
import { Header } from "../layout/Header";
import { Footer } from "../components/Footer";
import { PageChrome } from "../components/PageChrome";
import { Main } from "../components/Main";
import { Card } from "../components/Card";

type ArchivesPageProps = {
  props: PageContext;
};

function groupByYearMonth(posts: PostItem[]) {
  const byYear: Record<string, Record<string, PostItem[]>> = {};

  for (const post of posts) {
    const ts = postTimestampSeconds(post);
    if (!ts) continue;
    const d = postDate(post);
    const year = String(d.year());
    const month = String(d.month() + 1);
    byYear[year] ??= {};
    byYear[year][month] ??= [];
    byYear[year][month].push(post);
  }

  return byYear;
}

export const ArchivesPage: Component<ArchivesPageProps> = (p) => {
  const ctx = () => p.props;
  const cfg = () => getPaperConfig(ctx());
  const t = () => useTranslations(ctx().lang);

  const monthName = (month: number) =>
    dayjs()
      .locale(dayjsLocale(ctx().lang))
      .month(month - 1)
      .format("MMMM");

  const posts = () =>
    everkm.posts(ctx().request_id, {
      dir: POSTS_CONTENT_DIR,
      recursive: true,
      order_by: "date",
      order_direction: "desc",
      draft: false,
    }).items;

  const grouped = () => groupByYearMonth(posts());
  const years = () =>
    Object.keys(grouped()).sort((a, b) => Number(b) - Number(a));

  return (
    <>
      <Header ctx={ctx()} />
      <PageChrome ctx={ctx()} pageKey="archives" />
      <Main
        ctx={ctx()}
        pageKey="archives"
        pageTitle={t().pages.archivesTitle}
        pageDesc={t().pages.archivesDesc}
        layout="archives"
      >
        <For each={years()}>
          {(year) => {
            const months = Object.keys(grouped()[year]).sort(
              (a, b) => Number(b) - Number(a),
            );
            const yearCount = months.reduce(
              (sum, m) => sum + grouped()[year][m].length,
              0,
            );
            return (
              <div>
                <span class="text-2xl font-bold">{year}</span>
                <sup class="text-muted-foreground text-sm">{yearCount}</sup>
                <For each={months}>
                  {(month) => {
                    const monthPosts = [...grouped()[year][month]].sort(
                      (a, b) => postTimestampSeconds(b) - postTimestampSeconds(a),
                    );
                    return (
                      <div class="flex flex-col sm:flex-row">
                        <div class="mt-6 min-w-36 text-lg sm:my-6">
                          <span class="font-bold">
                            {monthName(Number(month))}
                          </span>
                          <sup class="text-muted-foreground text-xs">
                            {monthPosts.length}
                          </sup>
                        </div>
                        <ul>
                          <For each={monthPosts}>
                            {(post) => <Card ctx={ctx()} post={post} />}
                          </For>
                        </ul>
                      </div>
                    );
                  }}
                </For>
              </div>
            );
          }}
        </For>
      </Main>
      <Footer ctx={ctx()} config={cfg()} />
    </>
  );
};
