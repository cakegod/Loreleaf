import { BACKGROUND_ACTIONS } from "@/utils/actions";

export default defineContentScript({
	matches: ["<all_urls>"],
	main() {
		browser.runtime.onMessage.addListener(
			async (message, _sender, sendResponse) => {
				switch (message.action) {
					case CONTENT_ACTIONS.PROMPT: {
						console.log(message);
						sendResponse(prompt("context"));
						break;
					}
					case CONTENT_ACTIONS.TOAST: {
						alert(message.data);
						break;
					}

					default: {
						throw new Error(`${message.action} is invalid`);
					}
				}
			},
		);

		browser.runtime
			.sendMessage({
				action: BACKGROUND_ACTIONS.GET_CHARACTERS,
			})
			.then((d) => {
				console.log(d);
			});
	},
});
