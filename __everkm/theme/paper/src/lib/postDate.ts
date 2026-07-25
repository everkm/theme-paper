import dayjs from "dayjs";

/** Normalize everkm timestamp (seconds or ms) to unix seconds; 0 if missing. */
export function toUnixSeconds(raw?: number | null): number {
  if (!raw) return 0;
  return raw > 1e12 ? Math.floor(raw / 1000) : raw;
}

/** Normalize everkm post timestamp (seconds or ms) to unix seconds. */
export function postTimestampSeconds(post: PostItem): number {
  return toUnixSeconds(post.created_at || post.updated_at);
}

export function postDate(post: PostItem) {
  return dayjs.unix(postTimestampSeconds(post));
}
