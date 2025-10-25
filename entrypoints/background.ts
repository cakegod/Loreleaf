import { BACKGROUND_ACTIONS } from "@/utils/actions";
import { charactersStore } from "@/utils/stores";
import { onMessage, sendMessage } from "webext-bridge/background";

export default defineBackground(() => {
	onMessage(BACKGROUND_ACTIONS.GET_CHARACTERS, ({ data: { novelId } }) => {
		return charactersStore.dispatch({
			type: BACKGROUND_ACTIONS.GET_CHARACTERS,
			payload: {
				novelId: novelId ?? null,
			},
		});
	});
	onMessage(BACKGROUND_ACTIONS.ADD_CHARACTER, ({ data }) => {
		return charactersStore.dispatch({
			type: BACKGROUND_ACTIONS.ADD_CHARACTER,
			payload: data,
		});
	});

	browser.runtime.onInstalled.addListener(() => {
		browser.contextMenus.create({
			title: "selected",
			contexts: ["selection"],
			id: "selection",
		});
	});

	browser.contextMenus.onClicked.addListener(async (info, tab) => {
		if (!tab?.id || !info.selectionText) return;
		const name = info.selectionText.trim();
		const context = await sendMessage(
			CONTENT_ACTIONS.PROMPT,
			null,
			`content-script@${tab.id}`,
		);

		if (!context) throw new Error("context cannot be empty");

		// hardcode
		const novelId = "novel-1";
		charactersStore.dispatch({
			type: BACKGROUND_ACTIONS.ADD_CHARACTER,
			payload: { name, context, novelId },
		});

		await sendMessage(
			CONTENT_ACTIONS.TOAST,
			`Added ${name}!`,
			`content-script@${tab.id}`,
		);
	});
});
