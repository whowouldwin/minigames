import "./styles/globals.scss";
import { createApp } from "./app";

const app = createApp();
document.body.append(app.element);
app.start();
