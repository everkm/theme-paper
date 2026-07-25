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

/** URL of the content currently rendered (popstate already updates location). */
let renderedUrl =
  typeof window !== "undefined" ? window.location.href : "";

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

/** Absolute URL without hash — same document if equal. */
function normalizePageUrl(url: string): string {
  return new URL(url, window.location.href).href.split("#")[0]!;
}

function isSamePage(currentHref: string, nextHref: string): boolean {
  return normalizePageUrl(currentHref) === normalizePageUrl(nextHref);
}

function decodeHashId(hash: string): string {
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

/** Prefer the heading over its empty `a.heading-anchor` (scroll-margin + no focus ring). */
function preferHeading(el: HTMLElement): HTMLElement {
  return el.closest("h1, h2, h3, h4, h5, h6") ?? el;
}

/** Resolve hash target: element id, then everkm `a.heading-anchor[name]`. */
function resolveAnchorTarget(hash: string): HTMLElement | null {
  const id = decodeHashId(hash).trim();
  if (!id) return null;

  const byId = document.getElementById(id);
  if (byId) return preferHeading(byId);

  try {
    const byName = document.querySelector<HTMLElement>(
      `a.heading-anchor[name="${CSS.escape(id)}"]`,
    );
    if (byName) return preferHeading(byName);
  } catch {
    /* CSS.escape missing or selector invalid */
  }

  for (const anchor of document.querySelectorAll<HTMLAnchorElement>(
    "a.heading-anchor[name]",
  )) {
    if (anchor.getAttribute("name") === id) return preferHeading(anchor);
  }
  return null;
}

/** Browser fragment navigation focuses empty heading-anchors; drop that ring. */
function clearHeadingAnchorFocus(): void {
  const el = document.activeElement;
  if (
    el instanceof HTMLElement &&
    el.classList.contains("heading-anchor")
  ) {
    el.blur();
  }
}

function scrollNavigatedPage(url: string): void {
  const hash = getUrlHash(url);
  if (hash) {
    const target = resolveAnchorTarget(hash);
    if (target) {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    }
    clearHeadingAnchorFocus();
    // Hash present but target missing: keep scroll (do not jump to top).
    return;
  }
  // Both APIs: Safari historically preferred scrollTop for reliable jumps.
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  rootScrollTop(0);
}

/** Cold load / hard refresh with #hash: correct position after layout, clear focus ring. */
function applyInitialHash(): void {
  if (!getUrlHash(window.location.href)) return;
  // Double rAF: wait for layout after fonts/images that shift heading positions.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => scrollNavigatedPage(window.location.href)),
  );
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

function swapMainContent(
  doc: Document,
  url: string,
  navId: number,
  fromPopState: boolean,
): void {
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
    // popstate already updated location; pushState would pollute history.
    if (!fromPopState) history.pushState({}, "", url);
    renderedUrl = url;
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

function navigateTo(
  url: string,
  onFail: () => void,
  fromPopState = false,
): void {
  // Same document (path+search): hash-only or re-click — no fetch / VT.
  if (isSamePage(renderedUrl, url)) {
    if (!fromPopState && renderedUrl !== url) {
      history.pushState({}, "", url);
    }
    renderedUrl = url;
    scrollNavigatedPage(url);
    return;
  }

  const navId = startNavProgress();
  fetchPage(url)
    .then((doc) => swapMainContent(doc, url, navId, fromPopState))
    .catch(() => {
      doneNavProgress(navId);
      onFail();
    });
}

function onClick(e: MouseEvent): void {
  if (e.defaultPrevented || e.button !== 0) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
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

  renderedUrl = window.location.href;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  document.addEventListener("click", onClick);
  window.addEventListener("popstate", () => {
    navigateTo(
      window.location.href,
      () => window.location.reload(),
      true,
    );
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
  applyInitialHash();
  syncBackUrlFromPage();
  updateBackButton();

  document.addEventListener(PAPER_PAGE_SWAP, () => {
    syncBackUrlFromPage();
    updateBackButton();
    updateActiveNav();
  });
}
