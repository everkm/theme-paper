import { Component, Show } from "solid-js";
import { Socials } from "./Socials";
import type { PaperConfig } from "../lib/config";

type FooterProps = {
  ctx: PageContext;
  config: PaperConfig;
  noMarginTop?: boolean;
};

export const Footer: Component<FooterProps> = (props) => {
  const year = new Date().getFullYear();
  const hasSocials = () => (props.config.socials?.length ?? 0) > 0;
  const copyrightText = () =>
    props.config.copyright?.text || props.config.site.name;
  const copyrightLink = () => props.config.copyright?.link;

  return (
    <footer
      class={`app-layout border-t border-muted ${props.noMarginTop ? "" : "mt-auto"}`}
    >
      <div
        class={`flex flex-col items-center gap-3 py-4 sm:gap-4 ${
          hasSocials()
            ? "justify-between sm:flex-row-reverse"
            : "justify-center"
        }`}
      >
        <Socials ctx={props.ctx} socials={props.config.socials ?? []} />
        <div class="whitespace-nowrap text-sm text-muted-foreground">
          <span>&#169;{year}</span>
          <Show when={copyrightText()}>
            <span class="ml-1.5">
              <Show when={copyrightLink()} fallback={copyrightText()}>
                <a
                  href={copyrightLink()}
                  class="text-foreground hover:underline decoration-dashed underline-offset-4"
                >
                  {copyrightText()}
                </a>
              </Show>
            </span>
          </Show>
        </div>
      </div>
    </footer>
  );
};
