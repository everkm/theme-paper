const MISSING = Symbol("configDefaultMissing");

/**
 * Read config via `everkm.config` (materialized / i18n-resolved tree).
 * Path uses `/` separators (e.g. `algolia/app_id`).
 * Always pass `defaultValue` for optional keys — missing keys throw without it.
 */
export function configValue(
  requestId: string,
  path: string,
  defaultValue: unknown = MISSING,
): unknown {
  if (defaultValue !== MISSING) {
    return everkm.config(requestId, { key: path, default: defaultValue });
  }
  return everkm.config(requestId, { key: path });
}

/** Whether a top-level or nested config key exists. */
export function hasConfig(requestId: string, path: string): boolean {
  return everkm.has_config(requestId, { key: path });
}
