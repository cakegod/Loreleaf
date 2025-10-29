import { BACKGROUND_ACTIONS, CONTENT_ACTIONS } from "@/utils/actions";
import { charactersStore, currentNovelIdStore } from "@/utils/stores";
import { onMessage, sendMessage } from "webext-bridge/background";

export default defineBackground(() => {
	onMessage(
		BACKGROUND_ACTIONS.GET_CHARACTERS,
		async ({ data: { currentNovelOnly = true } }) => {
			try {
				if (!currentNovelOnly) {
					return charactersStore.get();
				}

				const currentNovelId = await currentNovelIdStore.get();
				const characters = await charactersStore.select((cs) =>
					cs.filter((c) => c.novelId === currentNovelId),
				);
				return characters;
			} catch (err) {
				console.error("GET_CHARACTERS failed:", err);
				throw err;
			}
		},
	);

	onMessage(BACKGROUND_ACTIONS.ADD_CHARACTER, async ({ data }) => {
		try {
			return await charactersStore.create(data);
		} catch (err) {
			console.error("ADD_CHARACTER failed:", err);
			throw err;
		}
	});

	browser.runtime.onInstalled.addListener(() => {
		charactersStore.subscribe(async (characters) => {
			const [tab] = await browser.tabs.query({
				active: true,
				lastFocusedWindow: true,
			});
			sendMessage(
				CONTENT_ACTIONS.CHARACTERS_CHANGED,
				characters,
				`content-script@${tab.id}`,
			);
		});
		browser.contextMenus.create({
			id: "character-selection",
			title: "Add Character",
			contexts: ["selection"],
		});
	});

	browser.contextMenus.onClicked.addListener(async (info, tab) => {
		if (!tab?.id || !info.selectionText) return;

		const name = info.selectionText.trim();
		const note = await sendMessage(
			CONTENT_ACTIONS.PROMPT,
			info.selectionText,
			`content-script@${tab.id}`,
		);
		const currentNovelId = await currentNovelIdStore.get();
		const newCharacter = await charactersStore.create({
			name,
			note,
			novelId: currentNovelId,
		});

		await sendMessage(
			CONTENT_ACTIONS.TOAST,
			`Added ${newCharacter.name} with "${newCharacter.note}"!`,
			`content-script@${tab.id}`,
		);
	});
});
