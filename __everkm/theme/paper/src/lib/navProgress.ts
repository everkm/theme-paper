const SHOW_DELAY_MS = 80;
const MIN_VISIBLE_MS = 400;
const HIDE_MS = 280;
const BAR_ID = "paper-nav-progress";

let generation = 0;
let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let visible = false;
let shownAt = 0;

function clearTimers(): void {
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function ensureBar(): HTMLElement {
  let el = document.getElementById(BAR_ID);
  if (el) return el;
  el = document.createElement("div");
  el.id = BAR_ID;
  el.className = "paper-nav-progress";
  el.setAttribute("aria-hidden", "true");
  document.body.appendChild(el);
  return el;
}

function removeBar(): void {
  document.getElementById(BAR_ID)?.remove();
  visible = false;
  shownAt = 0;
}

function setBusy(busy: boolean): void {
  const root = document.documentElement;
  if (busy) root.setAttribute("aria-busy", "true");
  else root.removeAttribute("aria-busy");
}

function activateBar(el: HTMLElement): void {
  visible = true;
  shownAt = performance.now();
  el.classList.add("is-active");
}

/** Begin navigation feedback. Returns a generation token for {@link done}. */
export function startNavProgress(): number {
  const id = ++generation;
  clearTimers();
  setBusy(true);

  const el = ensureBar();
  el.classList.remove("is-hiding");
  if (visible) {
    // Restart indeterminate animation on rapid re-nav.
    el.classList.remove("is-active");
    void el.offsetWidth;
    activateBar(el);
  } else {
    showTimer = setTimeout(() => {
      showTimer = null;
      if (id !== generation) return;
      activateBar(el);
    }, SHOW_DELAY_MS);
  }

  return id;
}

function fadeOut(id: number, el: HTMLElement): void {
  el.classList.add("is-hiding");
  hideTimer = setTimeout(() => {
    hideTimer = null;
    if (id !== generation) return;
    removeBar();
  }, HIDE_MS);
}

/** End navigation feedback for a matching generation. */
export function doneNavProgress(id: number): void {
  if (id !== generation) return;
  clearTimers();
  setBusy(false);

  const el = document.getElementById(BAR_ID);
  if (!el || !visible) {
    removeBar();
    return;
  }

  const remain = Math.max(0, MIN_VISIBLE_MS - (performance.now() - shownAt));
  if (remain > 0) {
    hideTimer = setTimeout(() => {
      hideTimer = null;
      if (id !== generation) return;
      fadeOut(id, el);
    }, remain);
    return;
  }

  fadeOut(id, el);
}
