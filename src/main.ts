import "./styles/globals.scss";
import "./firebase";
import { createApp } from "./app";

const app = createApp();
document.body.append(app.element);
app.start();
