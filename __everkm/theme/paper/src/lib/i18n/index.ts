import { en, type UIStrings } from "./lang/en";

const catalogs: Record<string, UIStrings> = { en };

export function useTranslations(lang?: string): UIStrings {
  return catalogs[lang || "en"] ?? en;
}
