import { Component, For, Show } from "solid-js";

type SocialsProps = {
  ctx: PageContext;
  socials: { name: string; url: string }[];
};

export const Socials: Component<SocialsProps> = (props) => {
  return (
    <Show when={props.socials.length > 0}>
      <div class="flex flex-wrap items-center gap-4">
        <For each={props.socials}>
          {(item) => (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-accent hover:underline decoration-dashed underline-offset-4"
              title={item.name}
            >
              {item.name}
            </a>
          )}
        </For>
      </div>
    </Show>
  );
};
