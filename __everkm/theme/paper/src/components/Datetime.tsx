import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Component, Show } from "solid-js";
import { useTranslations } from "../lib/i18n";
import { dayjsLocale } from "../lib/dayjsLocale";
import { getPaperConfig } from "../lib/config";
import { toUnixSeconds } from "../lib/postDate";
import { Icon } from "./Icon";
import IconCalendar from "../assets/icons/IconCalendar.svg";

dayjs.extend(utc);
dayjs.extend(timezone);

type DatetimeProps = {
  ctx: PageContext;
  createdAt?: number;
  updatedAt?: number;
  class?: string;
  size?: "sm" | "lg";
};

export const Datetime: Component<DatetimeProps> = (props) => {
  const t = () => useTranslations(props.ctx.lang);
  const cfg = () => getPaperConfig(props.ctx);
  const tz = () => cfg().site.timezone ?? "UTC";
  const locale = () => dayjsLocale(props.ctx.lang);
  const format = () => t().post.dateFormat;

  const pub = () => toUnixSeconds(props.createdAt);
  const mod = () => toUnixSeconds(props.updatedAt);

  const toDay = (unix: number) =>
    dayjs.unix(unix).tz(tz()).locale(locale()).format("YYYY-MM-DD");

  /** Meaningful update: later than publish and on a different calendar day. */
  const isModified = () => {
    if (!(mod() > pub() && mod() > 0 && pub() > 0)) return false;
    return toDay(mod()) !== toDay(pub());
  };

  /** Prefer publish date; fall back to updated_at when publish is missing. */
  const displayUnix = () => {
    if (isModified()) return mod();
    if (pub() > 0) return pub();
    if (mod() > 0) return mod();
    return 0;
  };

  const display = () =>
    dayjs.unix(displayUnix()).tz(tz()).locale(locale());

  const publishedLabel = () =>
    dayjs.unix(pub()).tz(tz()).locale(locale()).format(format());

  const size = () => props.size ?? "sm";
  const textClass = () =>
    size() === "lg" ? "text-sm sm:text-base" : "text-sm";

  return (
    <Show when={displayUnix() > 0}>
      <div
        class={`text-muted-foreground flex items-center gap-x-1 ${props.class ?? ""}`}
        title={
          isModified()
            ? `${t().post.publishedAt} ${publishedLabel()}`
            : undefined
        }
      >
        <Icon
          svg={IconCalendar}
          class={`inline-block ${size() === "sm" ? "size-4 min-w-4" : "size-5 min-w-5"}`}
        />
        <time
          class={`${textClass()} ${isModified() ? "italic font-bold" : ""}`}
          datetime={display().toISOString()}
        >
          {display().format(format())}
        </time>
      </div>
    </Show>
  );
};
