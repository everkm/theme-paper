type MountFn = (el: HTMLElement) => () => void;

const activeMounts = new Map<HTMLElement, () => void>();

const registry: Record<string, MountFn> = {};

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
