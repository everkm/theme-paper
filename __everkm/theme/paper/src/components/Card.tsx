import { Component } from "solid-js";
import { toTransitionName } from "../lib/toTransitionName";
import { Datetime } from "./Datetime";

type CardProps = {
  ctx: PageContext;
  post: PostItem;
  variant?: "h2" | "h3";
};

export const Card: Component<CardProps> = (props) => {
  const variant = () => props.variant ?? "h2";
  const href = () => props.post.url_path;

  const titleClass =
    "line-clamp-2 sm:line-clamp-none";

  const TitleTag = (p: { children: any }) => {
    const style = { "view-transition-name": toTransitionName(props.post.title) };
    if (variant() === "h3") {
      return (
        <h3 style={style} class={titleClass}>
          {p.children}
        </h3>
      );
    }
    return (
      <h2 style={style} class={titleClass}>
        {p.children}
      </h2>
    );
  };

  return (
    <li class="my-8">
      <a
        href={href()}
        class="text-accent text-lg font-medium decoration-dashed underline-offset-4 hover:underline focus-visible:no-underline focus-visible:underline-offset-0"
      >
        <TitleTag>{props.post.title}</TitleTag>
      </a>
      <Datetime
        class="mt-1.5"
        ctx={props.ctx}
        date={props.post.date}
        updatedAt={props.post.updated_at}
      />
      <p class="text-foreground/80 mt-3 text-sm leading-relaxed">
        {props.post.summary}
      </p>
    </li>
  );
};
