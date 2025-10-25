import { BACKGROUND_ACTIONS } from "@/utils/actions";
import { sendMessage, onMessage } from "webext-bridge/content-script";

export default defineContentScript({
	matches: ["<all_urls>"],
	main() {
		onMessage(CONTENT_ACTIONS.PROMPT, () => {
			return prompt("context");
		});
		onMessage(CONTENT_ACTIONS.TOAST, ({ data }) => alert(data));
		sendMessage(BACKGROUND_ACTIONS.GET_CHARACTERS, {}, "background").then(
			console.log,
		);
	},
});
