import { en, type UIStrings } from "./lang/en";
import { zh } from "./lang/zh";

const catalogs: Record<string, UIStrings> = { en, zh };

export function resolveLangKey(lang?: string): string {
  const normalized = (lang || "en").toLowerCase().replace("_", "-");
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh";
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  return normalized.split("-")[0] || "en";
}

export function useTranslations(lang?: string): UIStrings {
  const key = resolveLangKey(lang);
  return catalogs[key] ?? en;
}

export type { UIStrings };
