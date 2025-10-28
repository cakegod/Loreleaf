import { BACKGROUND_ACTIONS } from "@/utils/actions";
import { sendMessage, onMessage } from "webext-bridge/content-script";
import Mark from "mark.js";
import tippy from "tippy.js";
import "./style.css";
import "tippy.js/dist/tippy.css";
import { Character } from "@/utils/stores";

const html = String.raw;

function showContextDialog(selectedText: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const dialog = document.createElement("dialog");
		dialog.className = "context-modal";
		dialog.innerHTML = html`
			<form class="context-modal__form" method="dialog">
				<h2 class="context-modal__title">Add context to "${selectedText}"</h2>
				<div class="context-modal__field">
					<label class="context-modal__label" for="context-input">
						Context
					</label>
					<textarea
						class="context-modal__textarea"
						name="context"
						id="context-input"
						rows="6"
						required>
					</textarea>
				</div>
				<div class="context-modal__actions">
					<button
						name="cancel"
						type="button"
						class="context-modal__btn context-modal__btn--secondary">
						Cancel
					</button>
					<button
						name="submit"
						type="submit"
						class="context-modal__btn context-modal__btn--primary"
						disabled>
						Save
					</button>
				</div>
			</form>
		`;

		const form = dialog.querySelector("form")!;
		const formElements = form.elements as HTMLFormControlsCollection & {
			context: HTMLTextAreaElement;
			submit: HTMLButtonElement;
			cancel: HTMLButtonElement;
		};
		const context = formElements.context;
		const submitBtn = formElements.submit;
		const cancelBtn = formElements.cancel!;

		const cleanup = () => {
			dialog.close();
			dialog.remove();
		};

		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const value = context.value.trim();
			if (!value) return context.focus();
			resolve(value);
			cleanup();
		});

		cancelBtn.addEventListener("click", () => {
			reject(new Error("cancelled"));
			cleanup();
		});

		dialog.addEventListener("cancel", (e) => {
			e.preventDefault();
			reject(new Error("cancelled"));
			cleanup();
		});

		context.addEventListener("input", () => {
			submitBtn.disabled = !context.value.trim();
		});

		document.body.append(dialog);
		dialog.showModal();
	});
}

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
	async main(ctx) {
		const marker = new Mark(document.body);
		onMessage(CONTENT_ACTIONS.CHARACTERS_CHANGED, ({ data: characters }) => {
			markCharacters(characters, marker);
		});
		onMessage(CONTENT_ACTIONS.PROMPT, ({ data: selectedText }) => {
			return showContextDialog(selectedText);
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
