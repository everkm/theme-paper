import { Component, For, Show } from "solid-js";
import { useTranslations } from "../lib/i18n";
import { Socials } from "./Socials";
import type { PaperConfig } from "../lib/config";

type FooterProps = {
  ctx: PageContext;
  config: PaperConfig;
  noMarginTop?: boolean;
};

export const Footer: Component<FooterProps> = (props) => {
  const t = () => useTranslations(props.ctx.lang);
  const year = new Date().getFullYear();

  return (
    <footer
      class={`app-layout border-t border-muted ${props.noMarginTop ? "" : "mt-auto"}`}
    >
      <div class="flex flex-col items-center justify-between gap-3 py-4 sm:flex-row-reverse sm:gap-4">
        <Socials ctx={props.ctx} socials={props.config.socials ?? []} />
        <div class="flex flex-wrap items-center justify-center whitespace-nowrap text-sm">
          <span>
            {t().footer.copyright} &#169;{year}
          </span>
          <span class="mx-1.5 text-muted-foreground" aria-hidden="true">
            |
          </span>
          <span>{t().footer.allRightsReserved}</span>
        </div>
      </div>
    </footer>
  );
};
