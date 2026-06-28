type MountFn = (el: HTMLElement) => () => void;

const activeMounts = new Map<HTMLElement, () => void>();

const registry: Record<string, MountFn> = {
  pagefind: (el) => {
    const bundlePath = el.dataset.bundlePath ?? "/pagefind/";
    const isPreview = !!(window as any).__everkm_env_is_preview;
    let destroyed = false;
    let searchInstance: { destroy?: () => void } | null = null;

    const onIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

    onIdle(async () => {
      if (destroyed) return;

      if (isPreview && !document.querySelector('link[href*="pagefind"]')) {
        el.innerHTML = `
          <div class="bg-muted/75 rounded p-4 space-y-4 mb-4">
            <p><strong>Preview mode:</strong> Pagefind index may be unavailable until export build completes.</p>
          </div>
        `;
        return;
      }

      try {
        // @ts-expect-error — optional peer dependency
        const { PagefindUI } = await import("@pagefind/default-ui");
        if (destroyed) return;

        const params = new URLSearchParams(window.location.search);
        searchInstance = new PagefindUI({
          element: "#pagefind-search",
          bundlePath,
          showImages: false,
          showSubResults: true,
          processTerm(term: string) {
            params.set("q", term);
            history.replaceState(history.state, "", "?" + params.toString());
            const backUrl =
              el.dataset.backurl ?? window.location.pathname;
            sessionStorage.setItem("backUrl", `${backUrl}?${params.toString()}`);
            return term;
          },
        });

        const query = params.get("q");
        if (query && "triggerSearch" in (searchInstance as object)) {
          (searchInstance as { triggerSearch: (q: string) => void }).triggerSearch(
            query,
          );
        }
      } catch {
        el.innerHTML = `
          <div class="bg-muted/75 rounded p-4 space-y-4 mb-4">
            <p><strong>Search unavailable.</strong> Pagefind index not found. Build the site with pagefind enabled.</p>
          </div>
        `;
      }
    });

    return () => {
      destroyed = true;
      searchInstance?.destroy?.();
      el.innerHTML = "";
    };
  },
};

export function mountClientBlocks(root: ParentNode = document): void {
  root.querySelectorAll("[data-client-mount]").forEach((node) => {
    const el = node as HTMLElement;
    if (activeMounts.has(el)) return;
    const key = el.getAttribute("data-client-mount");
    if (!key || !registry[key]) return;
    const teardown = registry[key](el);
    activeMounts.set(el, teardown);
  });
}

export function teardownClientMounts(root: ParentNode = document): void {
  root.querySelectorAll("[data-client-mount]").forEach((node) => {
    const el = node as HTMLElement;
    const teardown = activeMounts.get(el);
    if (teardown) {
      teardown();
      activeMounts.delete(el);
    }
  });
}

export function installMobileNav(): void {
  const menuBtn = document.querySelector<HTMLButtonElement>("#menu-btn");
  const menuItems = document.querySelector("#menu-items");
  const menuIcon = document.querySelector("#menu-icon");
  const closeIcon = document.querySelector("#close-icon");

  if (!menuBtn || !menuItems || !menuIcon || !closeIcon) return;
  if (menuBtn.dataset.bound === "1") return;
  menuBtn.dataset.bound = "1";

  const openLabel = menuBtn.dataset.labelOpen ?? "Open menu";
  const closeLabel = menuBtn.dataset.labelClose ?? "Close menu";

  menuBtn.addEventListener("click", () => {
    const openMenu = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", openMenu ? "false" : "true");
    menuBtn.setAttribute("aria-label", openMenu ? openLabel : closeLabel);
    menuItems.classList.toggle("hidden");
    menuItems.classList.toggle("grid");
    menuIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");
  });
}
