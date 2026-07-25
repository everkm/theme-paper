import facebookSvg from "../assets/icons/socials/facebook.svg";
import githubSvg from "../assets/icons/socials/github.svg";
import linkedinSvg from "../assets/icons/socials/linkedin.svg";
import mailSvg from "../assets/icons/socials/mail.svg";
import pinterestSvg from "../assets/icons/socials/pinterest.svg";
import telegramSvg from "../assets/icons/socials/telegram.svg";
import whatsappSvg from "../assets/icons/socials/whatsapp.svg";
import xSvg from "../assets/icons/socials/x.svg";

const SOCIAL_ICON_MAP: Record<string, string> = {
  facebook: facebookSvg,
  github: githubSvg,
  linkedin: linkedinSvg,
  mail: mailSvg,
  email: mailSvg,
  pinterest: pinterestSvg,
  telegram: telegramSvg,
  whatsapp: whatsappSvg,
  x: xSvg,
  twitter: xSvg,
};

/** 查图标；`name` 缺失或非字符串时返回 undefined，不抛错。 */
export function getSocialIcon(name: unknown): string | undefined {
  if (typeof name !== "string") return undefined;
  const key = name.trim().toLowerCase();
  if (!key) return undefined;
  return SOCIAL_ICON_MAP[key];
}
