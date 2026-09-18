import {createHeader} from "../components/header";

export const createApp = (): HTMLDivElement => {
  const app = document.createElement("div");

  app.className = "app";
  app.append(createHeader());
  return app;
};
