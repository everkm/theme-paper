import { Component, Show } from "solid-js";
import { getPaperConfig } from "../lib/config";
import { useTranslations } from "../lib/i18n";
import { Header } from "../layout/Header";
import { Footer } from "../components/Footer";
import { PageChrome } from "../components/PageChrome";
import { Main } from "../components/Main";
import { APP_PROSE } from "../lib/proseClasses";

type AboutPageProps = {
  props: PageContext;
};

export const AboutPage: Component<AboutPageProps> = (p) => {
  const ctx = () => p.props;
  const cfg = () => getPaperConfig(ctx());
  const t = () => useTranslations(ctx().lang);
  const aboutPath = () => cfg().about ?? "/about.md";

  const aboutDoc = () =>
    everkm.post_detail(ctx().request_id, {
      path: aboutPath(),
      allow_missing: true,
    });

  const pageTitle = () => aboutDoc()?.title ?? t().nav.about;

  return (
    <>
      <Header ctx={ctx()} />
      <PageChrome ctx={ctx()} pageKey="about" />
      <Main
        ctx={ctx()}
        pageKey="about"
        pageTitle={pageTitle()}
        layout="about"
        class={APP_PROSE}
      >
        <Show
          when={aboutDoc()?.content_html}
          fallback={
            <p class="text-muted-foreground italic">{t().pages.aboutEmpty}</p>
          }
        >
          {(html) => <div innerHTML={html()} />}
        </Show>
      </Main>
      <Footer ctx={ctx()} config={cfg()} />
    </>
  );
};
