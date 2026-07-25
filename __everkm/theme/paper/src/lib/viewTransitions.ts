import {
  mountClientBlocks,
  teardownClientMounts,
  installMobileNav,
} from "./clientMounts";
import { carryThemeColorTo, installTheme } from "./theme";
import { installFootnoteBackButton } from "./footnote";
import { updateActiveNav } from "./activeNav";
import { syncBackUrlFromPage, updateBackButton } from "./backButton";
import { installLazyImg } from "./widgets/image-lazy";
import { installDcardUse, teardownDcard } from "./dcard";

import { PAPER_PAGE_SWAP } from "./events";
import { doneNavProgress, startNavProgress } from "./navProgress";

function shouldIntercept(anchor: HTMLAnchorElement): boolean {
  if (anchor.target === "_blank") return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.hasAttribute("data-no-vt")) return false;
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

function getUrlHash(url: string): string {
  try {
    return new URL(url, window.location.href).hash.slice(1);
  } catch {
    const idx = url.indexOf("#");
    return idx >= 0 ? url.slice(idx + 1) : "";
  }
}

/**
 * Instant scroll, bypassing html.scroll-smooth.
 * Must run inside the VT update callback so the new snapshot is already at the
 * target position — scrolling after transition.finished feels slow on long pages.
 *
 * Also strips the Tailwind `scroll-smooth` class: some engines still honor it for
 * scrollTo/scrollIntoView even when inline scroll-behavior is "auto".
 */
function withInstantScroll(fn: () => void): void {
  const root = document.documentElement;
  const prevBehavior = root.style.scrollBehavior;
  const hadSmoothClass = root.classList.contains("scroll-smooth");
  root.style.scrollBehavior = "auto";
  if (hadSmoothClass) root.classList.remove("scroll-smooth");
  try {
    fn();
  } finally {
    root.style.scrollBehavior = prevBehavior;
    if (hadSmoothClass) root.classList.add("scroll-smooth");
  }
}

function scrollNavigatedPage(url: string): void {
  withInstantScroll(() => {
    const hash = getUrlHash(url);
    if (hash) {
      let id: string;
      try {
        id = decodeURIComponent(hash);
      } catch {
        id = hash;
      }
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }
    // Both APIs: Safari historically preferred scrollTop for reliable jumps.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    rootScrollTop(0);
  });
}

function rootScrollTop(top: number): void {
  document.documentElement.scrollTop = top;
  if (document.body) document.body.scrollTop = top;
}

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
    const cloned = next.cloneNode(true) as HTMLElement;
    if (key === "header") {
      const liveSearch = current.querySelector("#header-in-search");
      const clonedSearch = cloned.querySelector("#header-in-search");
      if (liveSearch && clonedSearch) {
        clonedSearch.replaceWith(liveSearch);
      }
    }
    current.replaceWith(cloned);
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

function swapMainContent(doc: Document, url: string, navId: number): void {
  const nextMain = doc.querySelector("#main-content");
  const currentMain = document.querySelector("#main-content");
  if (!nextMain || !currentMain) {
    doneNavProgress(navId);
    window.location.href = url;
    return;
  }

  teardownClientMounts(currentMain);
  // Must run before innerHTML swap so uninstall sees outgoing dcard manifests.
  teardownDcard();

  // Finish the bar before VT starts so progress and page morph don't overlap.
  doneNavProgress(navId);

  const apply = () => {
    swapVtRegion(doc, "page-chrome", currentMain);
    swapVtRegion(doc, "header", currentMain);
    syncMainShell(currentMain as HTMLElement, nextMain as HTMLElement);
    currentMain.innerHTML = nextMain.innerHTML;
    const bottomAnchor =
      document.querySelector("footer") ?? currentMain.nextElementSibling;
    swapVtRegion(doc, "pagination", bottomAnchor);
    swapVtRegion(doc, "post-nav", bottomAnchor);
    history.pushState({}, "", url);
    // Scroll inside the VT update callback so the incoming snapshot is already
    // at the right offset (avoids a long smooth scroll after the transition).
    scrollNavigatedPage(url);
  };

  const title = doc.querySelector("title")?.textContent;
  if (title) document.title = title;

  if (
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    apply();
    afterSwap();
    return;
  }

  const transition = document.startViewTransition(apply);
  transition.finished.then(() => afterSwap()).catch(() => afterSwap());
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

function navigateTo(url: string, onFail: () => void): void {
  const navId = startNavProgress();
  fetchPage(url)
    .then((doc) => swapMainContent(doc, url, navId))
    .catch(() => {
      doneNavProgress(navId);
      onFail();
    });
}

function onClick(e: MouseEvent): void {
  const anchor = (e.target as Element)?.closest?.("a");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (!shouldIntercept(anchor)) return;
  e.preventDefault();
  syncBackUrlFromPage();
  const url = anchor.href;
  navigateTo(url, () => {
    window.location.href = url;
  });
}

export function installViewTransitions(): void {
  if ((window as any).__everkm_features_view_transitions === false) return;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  document.addEventListener("click", onClick);
  window.addEventListener("popstate", () => {
    navigateTo(window.location.href, () => window.location.reload());
  });
}

export function bootClient(): void {
  installTheme();
  installMobileNav();
  updateActiveNav();
  mountClientBlocks();
  installFootnoteBackButton("#article");
  installLazyImg("#main-content");
  installDcardUse("#main-content");
  installViewTransitions();
  syncBackUrlFromPage();
  updateBackButton();

  document.addEventListener(PAPER_PAGE_SWAP, () => {
    syncBackUrlFromPage();
    updateBackButton();
    updateActiveNav();
  });
}
