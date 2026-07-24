import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Component, Show } from "solid-js";
import { useTranslations } from "../lib/i18n";
import { dayjsLocale } from "../lib/dayjsLocale";
import { getPaperConfig } from "../lib/config";
import { Icon } from "./Icon";
import IconCalendar from "../assets/icons/IconCalendar.svg";

dayjs.extend(utc);
dayjs.extend(timezone);

type DatetimeProps = {
  ctx: PageContext;
  date?: number;
  updatedAt?: number;
  class?: string;
  size?: "sm" | "lg";
};

export const Datetime: Component<DatetimeProps> = (props) => {
  const t = () => useTranslations(props.ctx.lang);
  const cfg = () => getPaperConfig(props.ctx);
  const pub = () => props.date ?? 0;
  const mod = () => props.updatedAt ?? 0;
  const isModified = () => mod() > pub() && mod() > 0;
  const datetime = () =>
    dayjs
      .unix(isModified() ? mod() : pub())
      .tz(cfg().site.timezone ?? "UTC")
      .locale(dayjsLocale(props.ctx.lang));
  const size = () => props.size ?? "sm";

  return (
    <div
      class={`text-muted-foreground flex items-center gap-x-2 ${props.class ?? ""}`}
    >
      <Icon
        svg={IconCalendar}
        class={`inline-block ${size() === "sm" ? "size-4 min-w-4" : "size-5 min-w-5"}`}
      />
      <Show when={isModified()}>
        <span class={size() === "lg" ? "text-sm sm:text-base" : "text-sm"}>
          {t().post.updatedAt}:
        </span>
      </Show>
      <time
        class={size() === "lg" ? "text-sm sm:text-base" : "text-sm"}
        datetime={datetime().toISOString()}
      >
        {datetime().format(t().post.dateFormat)}
      </time>
    </div>
  );
};
