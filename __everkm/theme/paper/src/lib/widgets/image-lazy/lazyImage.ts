import { PAPER_PAGE_SWAP } from "../../events";

const PLACEHOLDER_DEFAULT_WIDTH = 300;
const PLACEHOLDER_DEFAULT_HEIGHT = 180;

function errorPlaceholder(width: number, height: number): string {
  const str = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect fill="#ddd" width="${width}" height="${height}"/><text fill="rgba(0,0,0,0.3)" font-family="sans-serif" font-size="${Math.floor(Math.min(width, height) * 0.12)}" font-weight="bold" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">Image loading failed</text></svg>`;
  const cleaned = str.replace(/[\t\n\r]/gim, "").replace(/\s\s+/g, " ");
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(cleaned)
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")}`;
}

type CleanupFn = (() => void) | null;

function loadLazyImage(image: HTMLImageElement, attr = "data-src"): void {
  const src = image.getAttribute(attr);
  if (!src) return;

  image.onload = () => {
    image.removeAttribute(attr);
  };
  image.onerror = () => {
    image.setAttribute(
      "src",
      errorPlaceholder(
        parseInt(image.getAttribute("width") || "0", 10) ||
          PLACEHOLDER_DEFAULT_WIDTH,
        parseInt(image.getAttribute("height") || "0", 10) ||
          PLACEHOLDER_DEFAULT_HEIGHT,
      ),
    );
    image.removeAttribute(attr);
  };

  image.src = src;
}

export function setupLazyImg(
  container: HTMLElement,
  attr = "data-src",
): CleanupFn {
  const observer = new IntersectionObserver((items) => {
    for (const item of items) {
      if (!item.isIntersecting) continue;
      loadLazyImage(item.target as HTMLImageElement, attr);
      observer.unobserve(item.target);
    }
  });

  const images = container.querySelectorAll<HTMLImageElement>(`img[${attr}]`);
  for (const image of images) {
    observer.observe(image);
  }

  return () => observer.disconnect();
}

/** Observe `img[data-src]` in container; re-run on page swap. */
export function installLazyImg(containerSelector: string): void {
  let currentCleanup: CleanupFn = null;

  const cleanup = () => {
    currentCleanup?.();
    currentCleanup = null;
  };

  const setup = () => {
    cleanup();
    const container = document.querySelector<HTMLElement>(containerSelector);
    if (!container) return;
    currentCleanup = setupLazyImg(container);
  };

  if (document.readyState !== "loading") {
    setup();
  } else {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  }

  document.addEventListener(PAPER_PAGE_SWAP, setup);
}
