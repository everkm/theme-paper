import { Component, For, Show } from "solid-js";
import { Icon } from "./Icon";
import { getSocialIcon } from "../lib/socialIcons";

type SocialsProps = {
  ctx: PageContext;
  socials: { name?: string; title?: string; url?: string }[];
};

export const Socials: Component<SocialsProps> = (props) => {
  return (
    <Show when={props.socials.length > 0}>
      <div class="flex flex-wrap items-center gap-4 text-sm">
        <For each={props.socials}>
          {(item) => {
            const label = (
              (typeof item.name === "string" && item.name) ||
              (typeof item.title === "string" && item.title) ||
              ""
            ).trim();
            const url = typeof item.url === "string" ? item.url.trim() : "";
            if (!label || !url) return null;

            const svg = getSocialIcon(label);

            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                class={
                  svg
                    ? "inline-flex items-center justify-center leading-none text-accent hover:opacity-80 transition-opacity"
                    : "inline-flex items-center leading-none text-accent hover:underline decoration-dashed underline-offset-4"
                }
                title={label}
                aria-label={svg ? label : undefined}
              >
                {svg ? (
                  <Icon svg={svg} class="size-5 shrink-0" />
                ) : (
                  label
                )}
              </a>
            );
          }}
        </For>
      </div>
    </Show>
  );
};
