/** Default page size aligned with everkm-publish `FetchPostsArgs` default limit. */
const FETCH_PAGE_SIZE = 50;

/**
 * Fetch every post matching `args`, paging past the API default limit (50).
 */
export function fetchAllPosts(
  requestId: string,
  args: FetchPostsArgs,
): PostItem[] {
  const first = everkm.posts(requestId, {
    ...args,
    offset: 0,
    limit: FETCH_PAGE_SIZE,
  });
  if (first.items.length >= first.total) {
    return first.items;
  }

  const items = [...first.items];
  let offset = first.items.length;
  while (offset < first.total) {
    const page = everkm.posts(requestId, {
      ...args,
      offset,
      limit: FETCH_PAGE_SIZE,
    });
    if (page.items.length === 0) break;
    items.push(...page.items);
    offset += page.items.length;
  }
  return items;
}
