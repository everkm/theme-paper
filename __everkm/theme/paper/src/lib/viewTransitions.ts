import {
  mountClientBlocks,
  teardownClientMounts,
  installMobileNav,
} from "./clientMounts";
import { carryThemeColorTo, installTheme } from "./theme";
import { updateActiveNav } from "./activeNav";
import { syncBackUrlFromPage, updateBackButton } from "./backButton";

const PAPER_PAGE_SWAP = "paper:page-swap";

function shouldIntercept(anchor: HTMLAnchorElement): boolean {
  if (anchor.target === "_blank") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:")) return false;
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

async function fetchPage(url: string): Promise<Document> {
  const res = await fetch(url, { headers: { "X-Paper-VT": "1" } });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  carryThemeColorTo(doc);
  return doc;
}

/** Sync #main-content shell attrs; spacing lives inside innerHTML only. */
function syncMainShell(
  current: HTMLElement,
  next: HTMLElement,
): void {
  for (const { name, value } of [...next.attributes]) {
    if (name === "id") continue;
    current.setAttribute(name, value);
  }
  for (const { name } of [...current.attributes]) {
    if (name === "id") continue;
    if (!next.hasAttribute(name)) current.removeAttribute(name);
  }
}

/** Replace or remove regions marked data-vt-swap (outside #main-content). */
function swapVtRegion(
  doc: Document,
  key: string,
  anchor: Element | null,
): void {
  const next = doc.querySelector(`[data-vt-swap="${key}"]`);
  const current = document.querySelector(`[data-vt-swap="${key}"]`);

  if (next && current) {
    current.replaceWith(next.cloneNode(true));
    return;
  }
  if (next && !current && anchor) {
    anchor.before(next.cloneNode(true));
    return;
  }
  if (!next && current) {
    current.remove();
  }
}

function swapMainContent(doc: Document, url: string): void {
  const nextMain = doc.querySelector("#main-content");
  const currentMain = document.querySelector("#main-content");
  if (!nextMain || !currentMain) {
    window.location.href = url;
    return;
  }

  teardownClientMounts(currentMain);

  const apply = () => {
    swapVtRegion(doc, "page-chrome", currentMain);
    swapVtRegion(doc, "header", currentMain);
    syncMainShell(currentMain as HTMLElement, nextMain as HTMLElement);
    currentMain.innerHTML = nextMain.innerHTML;
    swapVtRegion(
      doc,
      "pagination",
      document.querySelector("footer") ?? currentMain.nextElementSibling,
    );
  };

  const title = doc.querySelector("title")?.textContent;
  if (title) document.title = title;

  if (
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    apply();
    history.pushState({}, "", url);
    afterSwap();
    return;
  }

  const transition = document.startViewTransition(() => {
    apply();
    history.pushState({}, "", url);
  });
  transition.finished.then(afterSwap).catch(afterSwap);
}

function afterSwap(): void {
  installTheme();
  installMobileNav();
  updateActiveNav();
  updateBackButton();
  const main = document.querySelector("#main-content");
  if (main) mountClientBlocks(main);
  document.dispatchEvent(new CustomEvent(PAPER_PAGE_SWAP));
}

function onClick(e: MouseEvent): void {
  const anchor = (e.target as Element)?.closest?.("a");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (!shouldIntercept(anchor)) return;
  e.preventDefault();
  syncBackUrlFromPage();
  const url = anchor.href;
  fetchPage(url)
    .then((doc) => swapMainContent(doc, url))
    .catch(() => {
      window.location.href = url;
    });
}

export function installViewTransitions(): void {
  if ((window as any).__everkm_features_view_transitions === false) return;

  document.addEventListener("click", onClick);
  window.addEventListener("popstate", () => {
    fetchPage(window.location.href)
      .then((doc) => swapMainContent(doc, window.location.href))
      .catch(() => window.location.reload());
  });
}

export function bootClient(): void {
  installTheme();
  installMobileNav();
  updateActiveNav();
  mountClientBlocks();
  installViewTransitions();
  syncBackUrlFromPage();
  updateBackButton();

  document.addEventListener(PAPER_PAGE_SWAP, () => {
    syncBackUrlFromPage();
    updateBackButton();
    updateActiveNav();
  });
}
