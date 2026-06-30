import { Component, For, Show } from "solid-js";
import { useTranslations } from "../lib/i18n";
import { pageUrl } from "../lib/url";
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
    <footer class={`app-layout ${props.noMarginTop ? "" : "mt-auto"}`}>
      <div class="flex flex-col items-center justify-between border-t border-muted py-6 sm:flex-row-reverse sm:py-4">
        <Socials ctx={props.ctx} socials={props.config.socials ?? []} />
        <div class="my-2 flex flex-col items-center whitespace-nowrap sm:flex-row">
          <span>
            {t().footer.copyright} &#169; {year}
          </span>
          <span class="hidden sm:inline">&nbsp;|&nbsp;</span>
          <span>{t().footer.allRightsReserved}</span>
        </div>
      </div>
    </footer>
  );
};
