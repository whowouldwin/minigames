import { createHeader } from "../components/header";
import { createHero } from "../components/hero";

export const createApp = (): HTMLDivElement => {
  const app = document.createElement("div");

  app.className = "app";
  app.append(createHeader(), createHero());
  return app;
};
