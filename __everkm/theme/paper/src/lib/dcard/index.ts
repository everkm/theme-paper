import { PAPER_PAGE_SWAP } from "../events";
import { installDcard, type UninstallDcardFunction } from "./dcard";

export {
  installDcard,
  EVENT_DCARD_INSTALL,
  EVENT_DCARD_ASSETS_ERROR,
  EVENT_DCARD_UNINSTALL,
} from "./dcard";
export type { UninstallDcardFunction } from "./dcard";

let currentUninstall: UninstallDcardFunction = null;

/** Uninstall before DOM swap so events target the outgoing page. */
export function teardownDcard(): void {
  currentUninstall?.();
  currentUninstall = null;
}

function mountDcard(containerSelector: string): void {
  const container = document.querySelector<HTMLElement>(containerSelector);
  if (!container) return;
  currentUninstall = installDcard(container);
}

/** Install dcard assets in container; re-run on page swap. */
export function installDcardUse(containerSelector: string): void {
  const setup = () => mountDcard(containerSelector);

  if (document.readyState !== "loading") {
    setup();
  } else {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  }

  document.addEventListener(PAPER_PAGE_SWAP, setup);
}
