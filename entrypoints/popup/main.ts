import "./style.css";
import App from "./app.svelte";
import { mount } from "svelte";

mount(App, {
  // oxlint-disable-next-line no-non-null-assertion
  target: document.querySelector("#app")!,
});
