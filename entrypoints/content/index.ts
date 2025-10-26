import { BACKGROUND_ACTIONS } from "@/utils/actions";
import { sendMessage, onMessage } from "webext-bridge/content-script";
import Mark from "mark.js";
import tippy from "tippy.js";
import "./style.css";
import "tippy.js/dist/tippy.css";
import { Character } from "@/utils/stores";

const html = String.raw;

function markCharacters(characters: Character[], marker: Mark) {
	const charactersName = characters.map((c) => c.name);
	marker.mark(charactersName, {
		separateWordSearch: false,
		className: "highlight",
		element: "span",
		each(el: HTMLSpanElement) {
			tippy(el, {
				content: () => {
					const character = characters.find((c) => c.name === el.textContent)!;
					return character.context;
				},
			});

			tippy(el, {
				touch: ["hold", 300],
				trigger: "click",
				allowHTML: true,
				interactive: true,
				placement: "bottom",
				content: html`<button
						class="tippy-content__btn tippy-content__btn--edit">
						Edit
					</button>
					<button class="tippy-content__btn tippy-content__btn--remove">
						Remove
					</button>`,
			});
		},
	});
}

export default defineContentScript({
	matches: ["<all_urls>"],
	main(ctx) {
		const marker = new Mark(document.body);
		onMessage(CONTENT_ACTIONS.CHARACTERS_CHANGED, ({ data: characters }) => {
			markCharacters(characters, marker);
		});
		onMessage(CONTENT_ACTIONS.PROMPT, () => {
			return prompt("context");
		});
		onMessage(CONTENT_ACTIONS.TOAST, ({ data }) => alert(data));

		// initial mark
		// Hacky solution, since sometimes the marking is performed before the page is fully loaded
		ctx.setTimeout(() => {
			sendMessage(BACKGROUND_ACTIONS.GET_CHARACTERS, {}, "background").then(
				(characters) => {
					markCharacters(characters, marker);
				},
			);
		}, 500);

		// SPAs don't reload the page, need to listen to location changes
		ctx.addEventListener(window, "wxt:locationchange", ({ newUrl }) => {
			sendMessage(BACKGROUND_ACTIONS.GET_CHARACTERS, {}, "background").then(
				// TODO: only match specific URL?
				(characters) => {
					markCharacters(characters, marker);
				},
			);
		});
	},
});
