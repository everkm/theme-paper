import { Component, For, Show } from "solid-js";
import { getPaperConfig, type HeaderNavItem } from "../lib/config";
import { POSTS_INDEX_URL, POSTS_PATH } from "../lib/postsPath";
import { useTranslations } from "../lib/i18n";
import {
  currentPagePath,
  isAbsoluteUrl,
  isActivePath,
  pageUrl,
} from "../lib/url";
import { LinkButton } from "../components/LinkButton";
import { Icon } from "../components/Icon";
import IconMenuDeep from "../assets/icons/IconMenuDeep.svg";
import IconX from "../assets/icons/IconX.svg";
import IconArchive from "../assets/icons/IconArchive.svg";
import IconSunHigh from "../assets/icons/IconSunHigh.svg";
import IconMoon from "../assets/icons/IconMoon.svg";
import IconUnderline from "../assets/icons/IconUnderline.svg";
import { configValue } from "../lib/configValue";

type HeaderProps = {
  ctx: PageContext;
};

/** Attrs so view transitions do not intercept the click. */
function externalLinkAttrs(newWindow: boolean) {
  return {
    "data-no-vt": "",
    ...(newWindow
      ? { target: "_blank" as const, rel: "noopener" }
      : {}),
  };
}

function resolveNavHref(
  requestId: string,
  url: string | undefined,
): { href: string; absolute: boolean } {
  if (!url) return { href: "#", absolute: false };
  if (isAbsoluteUrl(url)) return { href: url, absolute: true };
  return { href: pageUrl(requestId, url), absolute: false };
}

export const Header: Component<HeaderProps> = (props) => {
  const cfg = () => getPaperConfig(props.ctx);
  const t = () => useTranslations(props.ctx.lang);
  const path = () => currentPagePath(props.ctx);
  const isActive = (target: string) => isActivePath(path(), target);

  const aboutCfg = () => cfg().about ?? "/about.md";
  const aboutLink = () => {
    const raw = aboutCfg();
    if (isAbsoluteUrl(raw)) {
      return {
        href: raw,
        external: true as const,
        newWindow: false,
      };
    }
    return {
      href: pageUrl(props.ctx.request_id, "/about/"),
      external: false as const,
      newWindow: false,
    };
  };

  const headerNavItems = () => cfg().header_nav ?? [];
  const headerNavBefore = () =>
    headerNavItems().filter((item) => item.at_before === true);
  const headerNavAfter = () =>
    headerNavItems().filter((item) => item.at_before !== true);

  const navItemAttrs = (item: HeaderNavItem) => {
    const { href, absolute } = resolveNavHref(props.ctx.request_id, item.url);
    const newWindow = item.new_window ?? absolute;
    return {
      href,
      ...(absolute || newWindow ? externalLinkAttrs(newWindow) : {}),
    };
  };

  const renderNavItem = (item: HeaderNavItem) => (
    <li class="col-span-2">
      <a {...navItemAttrs(item)}>{item.title}</a>
    </li>
  );

  return (
    <>
      <a
        id="skip-to-content"
        href="#main-content"
        class="bg-background text-accent absolute start-16 -top-full z-50 px-3 py-2 backdrop-blur-lg transition-all focus:top-4"
      >
        {t().a11y.skipToContent}
      </a>
      <header
        class="app-layout flex flex-col items-center justify-between sm:flex-row"
        data-vt-swap="header"
      >
        <div class="border-border bg-background relative flex w-full items-baseline justify-between border-b py-4 sm:items-center sm:py-6">
          <a
            href={pageUrl(props.ctx.request_id, "/index.html")}
            class="absolute py-1 text-xl leading-8 font-semibold whitespace-nowrap sm:static sm:my-auto sm:text-2xl sm:leading-none"
          >
            {cfg().site.name}
          </a>
          <nav
            id="nav-menu"
            class="flex w-full flex-col items-center sm:ms-2 sm:flex-row sm:justify-end sm:space-x-4 sm:py-0"
          >
            <button
              id="menu-btn"
              class="focus-outline self-end p-2 sm:hidden"
              aria-label={t().a11y.openMenu}
              aria-expanded="false"
              aria-controls="menu-items"
              data-label-open={t().a11y.openMenu}
              data-label-close={t().a11y.closeMenu}
              type="button"
            >
              <Icon svg={IconX} class="hidden" id="close-icon" />
              <Icon svg={IconMenuDeep} id="menu-icon" />
            </button>
            <ul
              id="menu-items"
              class="[&>li>a:hover]:text-accent mt-4 hidden w-44 grid-cols-2 place-content-center gap-2 sm:mt-0 sm:flex sm:w-auto sm:gap-x-5 sm:gap-y-0 sm:[&>li]:h-8 [&>li>a]:block [&>li>a]:px-4 [&>li>a]:py-3 [&>li>a]:text-center [&>li>a]:font-medium sm:[&>li>a]:px-2 sm:[&>li>a]:py-1"
            >
              <Show
                when={configValue(props.ctx.request_id, "algolia_search", null)}
              >
                <li class="col-span-2 flex items-center justify-center sm:col-span-1">
                  <div id="header-in-search">
                    <x-in-search
                      app-id={String(
                        configValue(
                          props.ctx.request_id,
                          "algolia_search/app_id",
                          "",
                        ),
                      )}
                      api-key={String(
                        configValue(
                          props.ctx.request_id,
                          "algolia_search/api_key",
                          "",
                        ),
                      )}
                      index={String(
                        configValue(
                          props.ctx.request_id,
                          "algolia_search/index_name",
                          "",
                        ),
                      )}
                      site={String(
                        configValue(
                          props.ctx.request_id,
                          "algolia_search/site",
                          "",
                        ),
                      )}
                      only-button="false"
                    />
                  </div>
                </li>
              </Show>
              <For each={headerNavBefore()}>{renderNavItem}</For>
              <li class="col-span-2">
                <a
                  href={pageUrl(props.ctx.request_id, POSTS_INDEX_URL)}
                  data-nav-path={POSTS_PATH}
                  class={isActive(POSTS_PATH) ? "active-nav" : ""}
                >
                  {t().nav.posts}
                </a>
              </li>
              <li class="col-span-2">
                <a
                  href={pageUrl(props.ctx.request_id, "/tags/index.html")}
                  data-nav-path="/tags"
                  class={isActive("/tags") ? "active-nav" : ""}
                >
                  {t().nav.tags}
                </a>
              </li>
              <li class="col-span-2">
                <Show
                  when={aboutLink().external}
                  fallback={
                    <a
                      href={aboutLink().href}
                      data-nav-path="/about"
                      class={isActive("/about") ? "active-nav" : ""}
                    >
                      {t().nav.about}
                    </a>
                  }
                >
                  <a href={aboutLink().href} {...externalLinkAttrs(true)}>
                    {t().nav.about}
                  </a>
                </Show>
              </li>
              <For each={headerNavAfter()}>{renderNavItem}</For>
              <Show when={cfg().features?.show_archives !== false}>
                <li class="col-span-2">
                  <LinkButton
                    href={pageUrl(props.ctx.request_id, "/archives/index.html")}
                    data-nav-path="/archives"
                    data-nav-icon=""
                    class={`focus-outline flex size-full justify-center p-3 sm:relative sm:size-8 sm:p-0 ${isActive("/archives") ? "max-sm:underline max-sm:decoration-wavy max-sm:decoration-2 max-sm:underline-offset-8" : ""}`}
                    title={t().nav.archives}
                    aria-label={t().nav.archives}
                  >
                    <Icon
                      svg={IconArchive}
                      class="hidden sm:absolute sm:top-1/2 sm:left-1/2 sm:block sm:size-6 sm:-translate-x-1/2 sm:-translate-y-1/2"
                    />
                    <span class="sm:sr-only">{t().nav.archives}</span>
                    <span
                      data-nav-active-icon
                      aria-hidden="true"
                      class={`pointer-events-none scale-125 max-sm:hidden sm:absolute sm:-bottom-2 sm:left-1/2 sm:w-6 sm:-translate-x-1/2 ${isActive("/archives") ? "" : "hidden"}`}
                    >
                      <Icon svg={IconUnderline} class="w-6" />
                    </span>
                  </LinkButton>
                </li>
              </Show>
              <Show when={cfg().features?.light_and_dark_mode !== false}>
                <li class="col-span-2 flex items-center justify-center sm:col-span-1">
                  <button
                    id="theme-btn"
                    class="focus-outline hover:[&>svg]:stroke-accent relative flex size-8 items-center justify-center"
                    title={t().a11y.toggleTheme}
                    aria-label="auto"
                    aria-live="polite"
                    type="button"
                  >
                    <Icon
                      svg={IconMoon}
                      class="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
                    />
                    <Icon
                      svg={IconSunHigh}
                      class="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
                    />
                  </button>
                </li>
              </Show>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};
