import { Component, Show } from "solid-js";
import { Datetime } from "./Datetime";

type CardProps = {
  ctx: PageContext;
  post: PostItem;
  variant?: "h2" | "h3";
  /**
   * `stack` (default): title, date, summary.
   * `row`: title + date only; one line on `sm+` (date right-aligned), two lines on small screens.
   */
  layout?: "stack" | "row";
};

export const Card: Component<CardProps> = (props) => {
  const variant = () => props.variant ?? "h2";
  const layout = () => props.layout ?? "stack";
  const href = () => props.post.url_path;

  const titleClass = () =>
    layout() === "row"
      ? "truncate"
      : "line-clamp-2 sm:line-clamp-none";

  const TitleTag = (p: { children: any }) => {
    if (variant() === "h3") {
      return <h3 class={titleClass()}>{p.children}</h3>;
    }
    return <h2 class={titleClass()}>{p.children}</h2>;
  };

  const titleLink = () => (
    <a
      href={href()}
      class="text-accent min-w-0 decoration-dashed underline-offset-4 hover:underline focus-visible:no-underline focus-visible:underline-offset-0"
    >
      <TitleTag>{props.post.title}</TitleTag>
    </a>
  );

  return (
    <Show
      when={layout() === "row"}
      fallback={
        <li class="my-8">
          {titleLink()}
          <Datetime
            class="mt-1.5"
            ctx={props.ctx}
            createdAt={props.post.created_at}
            updatedAt={props.post.updated_at}
          />
          <p class="text-foreground/80 mt-3 text-sm leading-relaxed">
            {props.post.summary}
          </p>
        </li>
      }
    >
      <li class="-mx-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/40">
        <div class="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          {titleLink()}
          <Datetime
            class="shrink-0 sm:justify-end"
            ctx={props.ctx}
            createdAt={props.post.created_at}
            updatedAt={props.post.updated_at}
          />
        </div>
      </li>
    </Show>
  );
};
