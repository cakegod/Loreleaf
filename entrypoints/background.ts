import { BACKGROUND_ACTIONS, CONTENT_ACTIONS } from "@/utils/actions";
import { charactersStore, currentNovelIdStore } from "@/utils/stores";
import { onMessage, sendMessage } from "webext-bridge/background";

export default defineBackground(() => {
	onMessage(
		BACKGROUND_ACTIONS.GET_CHARACTERS,
		async ({ data: { currentNovelOnly = true } }) => {
			try {
				const characters = await charactersStore.getState();

				if (!currentNovelOnly) {
					return characters;
				}

				const currentNovelId = await currentNovelIdStore.getState();
				return await charactersStore.select((characters) =>
					characters.filter((c) => c.novelId === currentNovelId),
				);
			} catch (err) {
				console.error("GET_CHARACTERS failed:", err);
				throw err;
			}
		},
	);

	onMessage(BACKGROUND_ACTIONS.ADD_CHARACTER, async ({ data }) => {
		try {
			return await charactersStore.dispatch({
				type: BACKGROUND_ACTIONS.ADD_CHARACTER,
				payload: data,
			});
		} catch (err) {
			console.error("ADD_CHARACTER failed:", err);
			throw err;
		}
	});

	browser.runtime.onInstalled.addListener(() => {
		browser.contextMenus.create({
			id: "character-selection",
			title: "Add Character",
			contexts: ["selection"],
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

		if (!context) {
			console.warn("context cannot be empty");
			return;
		}

		const currentNovelId = await currentNovelIdStore.getState();

		await charactersStore.dispatch({
			type: BACKGROUND_ACTIONS.ADD_CHARACTER,
			payload: { name, context, novelId: currentNovelId },
		});

		await sendMessage(
			CONTENT_ACTIONS.TOAST,
			`Added ${name}!`,
			`content-script@${tab.id}`,
		);
	});
});
