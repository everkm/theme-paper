import { Component } from "solid-js";
import { useTranslations } from "../lib/i18n";
import { LinkButton } from "./LinkButton";
import { Icon } from "./Icon";
import IconArrowRight from "../assets/icons/IconArrowRight.svg";

/** Paper Theme demo / docs site. */
export const PAPER_THEME_DEMO_URL = "https://paper.theme.everkm.com/";

type EmptyPostsGuideProps = {
  ctx: PageContext;
  class?: string;
};

export const EmptyPostsGuide: Component<EmptyPostsGuideProps> = (props) => {
  const t = () => useTranslations(props.ctx.lang);

  return (
    <section
      class={`border-border border-dashed border px-6 py-10 text-center ${props.class ?? ""}`}
      aria-label={t().home.emptyPostsTitle}
    >
      <h2 class="text-xl font-semibold tracking-wide">
        {t().home.emptyPostsTitle}
      </h2>
      <p class="text-foreground/80 mx-auto mt-3 max-w-md text-sm leading-relaxed">
        {t().home.emptyPostsDesc}
      </p>
      <div class="mt-6">
        <LinkButton
          href={PAPER_THEME_DEMO_URL}
          class="text-accent"
          target="_blank"
          rel="noopener noreferrer"
          data-no-vt=""
        >
          {t().home.emptyPostsCta}
          <Icon svg={IconArrowRight} class="inline-block rtl:-rotate-180" />
        </LinkButton>
      </div>
    </section>
  );
};
