export interface PaginationState {
  pageNo: number;
  pageSize: number;
  offset: number;
  pageCount: number;
}

export function readPagination(
  qs: Record<string, unknown>,
  pageSize: number,
  total: number,
): PaginationState {
  const pageNo = Math.max(1, parseInt(String(qs?.page ?? "1"), 10) || 1);
  const size = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 4;
  const offset = (pageNo - 1) * size;
  const pageCount = Math.max(1, Math.ceil(total / size));
  return { pageNo, pageSize: size, offset, pageCount };
}

export function paginationHref(base: string, targetPage: number): string {
  const normalized = base.replace(/\/+$/, "");
  if (targetPage <= 1) return `${normalized}/index.html`;
  return `${normalized}/index.p${targetPage}.html`;
}
