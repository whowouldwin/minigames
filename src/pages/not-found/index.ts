import { createButton } from "../../components/ui/button";
import "./not-found-page.scss";

export const createNotFoundPage = (returnHome: () => void): HTMLElement => {
  const main = document.createElement("main");
  main.className = "not-found-page";
  main.setAttribute("aria-labelledby", "not-found-title");

  const content = document.createElement("div");
  content.className = "not-found-page__content";

  const code = document.createElement("p");
  code.className = "not-found-page__code";
  code.textContent = "404";
  code.setAttribute("aria-hidden", "true");

  const heading = document.createElement("h1");
  heading.id = "not-found-title";
  heading.textContent = "Page not found";

  const message = document.createElement("p");
  message.className = "not-found-page__message";
  message.textContent =
    "The page you requested doesn’t exist. You can return to Home and keep exploring.";

  const homeButton = createButton("Return to Home Page", "filled", "large");
  homeButton.classList.add("not-found-page__home");
  homeButton.addEventListener("click", returnHome);

  content.append(code, heading, message, homeButton);
  main.append(content);
  return main;
};
