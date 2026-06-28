import { Component } from "solid-js";
import { getPaperConfig } from "../lib/config";
import { useTranslations } from "../lib/i18n";
import { pageUrl } from "../lib/url";
import { Header } from "../layout/Header";
import { Footer } from "../components/Footer";
import { PageChrome } from "../components/PageChrome";
import { Main } from "../components/Main";

type SearchPageProps = {
  props: PageContext;
};

export const SearchPage: Component<SearchPageProps> = (p) => {
  const ctx = () => p.props;
  const cfg = () => getPaperConfig(ctx());
  const t = () => useTranslations(ctx().lang);
  const bundlePath = () =>
    pageUrl(ctx().request_id, "/pagefind/").replace(/\/?$/, "/");

  return (
    <>
      <Header ctx={ctx()} />
      <PageChrome ctx={ctx()} pageKey="search" />
      <Main
        ctx={ctx()}
        pageKey="search"
        pageTitle={t().pages.searchTitle}
        pageDesc={t().pages.searchDesc}
        layout="search"
      >
        <div
          id="pagefind-search"
          data-client-mount="pagefind"
          data-vt-persist=""
          data-bundle-path={bundlePath()}
          data-backurl={pageUrl(ctx().request_id, "/search/index.html")}
        />
      </Main>
      <Footer ctx={ctx()} config={cfg()} />
    </>
  );
};
