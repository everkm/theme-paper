/**
 * Load dcard assets from inline JSON manifests and emit install/uninstall events.
 *
 * Manifest shape (injected by everkm-publish):
 * <script type="application/json" data-dcard="flash_player">
 *   { "js": ["..."], "css": ["..."] }
 * </script>
 */

interface IDcard {
  js?: string[];
  css?: string[];
}

const EVENT_DCARD_INSTALL = "dcard:install";
const EVENT_DCARD_UNINSTALL = "dcard:uninstall";
const EVENT_DCARD_ASSETS_ERROR = "dcard:assets:error";

const loadedAssetsCache = new Set<string>();

function loadJS(asset: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (loadedAssetsCache.has(asset)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = asset;
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      loadedAssetsCache.add(asset);
      resolve();
    };
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${asset}`));
    };
    document.head.appendChild(script);
  });
}

function loadCSS(asset: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (loadedAssetsCache.has(asset)) {
      resolve();
      return;
    }

    const existingLink = document.querySelector(`link[href="${asset}"]`);
    if (existingLink) {
      loadedAssetsCache.add(asset);
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.href = asset;
    link.rel = "stylesheet";

    const checkLoaded = () => {
      try {
        const sheets = document.styleSheets;
        for (let i = 0; i < sheets.length; i++) {
          if (sheets[i].href === asset || sheets[i].ownerNode === link) {
            loadedAssetsCache.add(asset);
            resolve();
            return;
          }
        }
        setTimeout(checkLoaded, 50);
      } catch {
        loadedAssetsCache.add(asset);
        resolve();
      }
    };

    link.onerror = () => {
      reject(new Error(`Failed to load stylesheet: ${asset}`));
    };

    document.head.appendChild(link);
    checkLoaded();
  });
}

type UninstallDcardFunction = (() => void) | null;

function installDcard(parent: HTMLElement): UninstallDcardFunction {
  const elements = parent.querySelectorAll(
    "script[type='application/json'][data-dcard]",
  );
  if (!elements.length) return null;

  Array.from(elements).forEach(async (element) => {
    const dcardName = element.getAttribute("data-dcard");
    if (!dcardName) return;

    let dcardData: IDcard;
    try {
      dcardData = JSON.parse(element.textContent || "{}") as IDcard;
    } catch (e) {
      console.error(`installDcard: parse failed [${dcardName}]`, e);
      element.dispatchEvent(
        new CustomEvent(EVENT_DCARD_ASSETS_ERROR, {
          detail: { dcardName, error: e, element, container: parent },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    const jsAssets = Array.isArray(dcardData.js) ? dcardData.js : [];
    const cssAssets = Array.isArray(dcardData.css) ? dcardData.css : [];
    if (jsAssets.length === 0 && cssAssets.length === 0) return;

    try {
      await Promise.all([
        ...jsAssets.map(loadJS),
        ...cssAssets.map(loadCSS),
      ]);
      element.dispatchEvent(
        new CustomEvent(EVENT_DCARD_INSTALL, {
          detail: {
            dcardName,
            js: jsAssets,
            css: cssAssets,
            element,
            container: parent,
          },
          bubbles: true,
          composed: true,
        }),
      );
    } catch (error) {
      console.error(`installDcard: assets failed [${dcardName}]`, error);
      element.dispatchEvent(
        new CustomEvent(EVENT_DCARD_ASSETS_ERROR, {
          detail: {
            dcardName,
            error,
            js: jsAssets,
            css: cssAssets,
            element,
            container: parent,
          },
          bubbles: true,
          composed: true,
        }),
      );
    }
  });

  return () => uninstallDcard(parent);
}

function uninstallDcard(parent: HTMLElement) {
  const elements = parent.querySelectorAll(
    "script[type='application/json'][data-dcard]",
  );
  for (const element of Array.from(elements)) {
    const dcardName = element.getAttribute("data-dcard");
    if (!dcardName) continue;
    element.dispatchEvent(
      new CustomEvent(EVENT_DCARD_UNINSTALL, {
        detail: { dcardName, element, container: parent },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

export {
  installDcard,
  EVENT_DCARD_INSTALL,
  EVENT_DCARD_ASSETS_ERROR,
  EVENT_DCARD_UNINSTALL,
};

export type { UninstallDcardFunction };
