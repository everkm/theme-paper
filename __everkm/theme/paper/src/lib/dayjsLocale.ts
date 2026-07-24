import "dayjs/locale/zh-cn";
import { resolveLangKey } from "./i18n";

/** Map site/UI language to a dayjs locale id. */
export function dayjsLocale(lang?: string): string {
  const key = resolveLangKey(lang);
  if (key === "zh") return "zh-cn";
  return "en";
}
