import "./shadow-style.css";
import { BACKGROUND_ACTIONS, CONTENT_ACTIONS } from "@/utils/actions";
import { onMessage, sendMessage } from "webext-bridge/content-script";
import type { Character } from "@/utils/stores";
import Mark from "mark.js";
import { delegate } from "tippy.js";
import pageStyle from "./page-style.css?inline";
import { showContextDialog } from "./context-dialog";

function markCharacters(characters: Character[], marker: Mark): void {
  requestIdleCallback(() => {
    const charactersName = characters.map((c) => c.name);
    const charMap = new Map(characters.map((c) => [c.name.toLowerCase(), c]));
    console.log(characters);
    marker.unmark({
      done() {
        marker.mark(charactersName, {
          separateWordSearch: false,
          className: "loreleaf_highlight",
          element: "span",
          each(el: HTMLSpanElement) {
            const character = charMap.get(el.textContent.toLowerCase());
            el.dataset.tippyContent = character?.note ?? "No context";
          },
        });
      },
    });

    // TODO: it seems tippy doesn't allow two delegates for the same element

    // delegate(document.body, {
    // 	touch: ["hold", 300],
    // 	target: ".loreleaf_highlight",
    // 	trigger: "click",
    // 	allowHTML: true,
    // 	interactive: true,
    // 	placement: "bottom",
    // 	appendTo: container,
    // 	content: `<button class="tippy-content__btn tippy-content__btn--edit">
    // 		Edit
    // 	</button>
    // 	<button class="tippy-content__btn tippy-content__btn--remove">
    // 		Remove
    // 	</button>`,
    // });
  });
}

function appendPageStyles(): void {
  const style = document.createElement("style");
  style.innerHTML = pageStyle;
  document.head.append(style);
}

function registerMessageListeners(marker: Mark, container: HTMLElement): void {
  onMessage(CONTENT_ACTIONS.PROMPT, async ({ data: selectedText }) => {
    try {
      const userInput = await showContextDialog(selectedText, container);
      return userInput;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
      throw error;
    }
  });

  onMessage(CONTENT_ACTIONS.CHARACTERS_CHANGED, ({ data: characters }) => {
    markCharacters(characters, marker);
  });

  onMessage(CONTENT_ACTIONS.TOAST, ({ data }) => {
    alert(data);
  });
}

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    appendPageStyles();

    const ui = await createShadowRootUi(ctx, {
      name: "content-script",
      position: "inline",
      async onMount(container) {
        const marker = new Mark(document.body);
        registerMessageListeners(marker, container);

        // initial mark
        const characters = await sendMessage(
          BACKGROUND_ACTIONS.GET_CHARACTERS,
          { type: "current" },
          "background",
        );

        delegate(document.body, {
          target: ".loreleaf_highlight",
          appendTo: container,
          trigger: "mouseenter focus",
        });

        markCharacters(characters, marker);

        // SPAs change URLs without reloading the page.
        // The 'wxt:locationchange' event is dispatched by the extension to detect such navigation,
        // so we can update highlights when the URL changes.
        ctx.addEventListener(globalThis, "wxt:locationchange", async () => {
          const characters = await sendMessage(
            BACKGROUND_ACTIONS.GET_CHARACTERS,
            { type: "current" },
            "background",
          );
          markCharacters(characters, marker);
        });
      },
    });

    ui.mount();
  },
});
