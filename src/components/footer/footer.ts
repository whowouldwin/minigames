import { createSiteLogo } from "../ui/site-logo";
import shareIcon from "../../assets/icons/share.png";
import chatIcon from "../../assets/icons/chat.png";
import rssIcon from "../../assets/icons/rss.png";
import codeIcon from "../../assets/icons/code.png";
import type { AppPage } from "../../types/app-page";
import { footerNavigationItems } from "../navigation/navigation-items";
import { setupPageNavigation } from "../navigation/setup-page-navigation";
import "./footer.scss";

export const createFooter = (
  navigateTo: (page: AppPage) => void,
): HTMLElement => {
  const footer: HTMLElement = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML = `
    <div class="footer__top">
      <div class="footer__brand"><p>Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.</p></div>
      <div class="footer__links">
        <nav aria-label="Explore"><h2>Explore</h2><ul>${footerNavigationItems
          .map(
            ({ label, href, targetPage }): string =>
              `<li><a href="${href}" data-target-page="${targetPage}">${label}</a></li>`,
          )
          .join("")}</ul></nav>
        <nav aria-label="Company"><h2>Company</h2><ul>${["About Us", "Contact", "Privacy Policy", "Terms of Service"].map((label: string): string => `<li><a href="./">${label}</a></li>`).join("")}</ul></nav>
        <div class="footer__community"><h2>Community</h2><div class="footer__social">
          <a href="./" aria-label="Share"><img src="${shareIcon}" alt="" /></a>
          <a href="./" aria-label="Community chat"><img src="${chatIcon}" alt="" /></a>
          <a href="./" aria-label="RSS feed"><img src="${rssIcon}" alt="" /></a>
        </div></div>
      </div>
    </div>
    <div class="footer__bottom">
      <p class="footer__copyright">© 2026 MiniGames. All rights reserved.</p>
      <a class="footer__credit" href="https://rs.school/courses/short-track"><span class="footer__rs" aria-hidden="true">RS</span>RS School</a>
      <a class="footer__credit" href="https://github.com/whowouldwin"><span class="footer__code"><img src="${codeIcon}" alt="" /></span>@whowouldwin</a>
      <p class="footer__love">Designed with love</p>
    </div>`;
  footer.querySelector(".footer__brand")?.prepend(createSiteLogo());

  for (const link of footer.querySelectorAll<HTMLAnchorElement>(
    ":scope .footer__brand a, :scope .footer__links a",
  )) {
    const page: AppPage =
      link.dataset.targetPage === "library" ? "library" : "home";

    setupPageNavigation(link, page, navigateTo);
  }

  return footer;
};
