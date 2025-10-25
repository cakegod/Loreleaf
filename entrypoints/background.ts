import { BACKGROUND_ACTIONS } from "@/utils/actions";
import { Character, charactersStore } from "@/utils/stores";

async function addCharacter(data: Omit<Character, "id">): Promise<Character> {
	const id = crypto.randomUUID();
	const allChars = await charactersStore.getValue();
	allChars[id] = { id, ...data };
	await charactersStore.setValue(allChars);
	return allChars[id];
}

async function getCharacters(filters?: {
	novelId?: string;
}): Promise<Character[]> {
	return charactersStore.getValue().then((characters) => {
		const charactersArray = Object.values(characters);
		return filters?.novelId
			? charactersArray.filter((c) => c.novelId === filters.novelId)
			: charactersArray;
	});
}

export default defineBackground(() => {
	browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
		switch (message.action) {
			case BACKGROUND_ACTIONS.GET_CHARACTERS: {
				getCharacters({ ...message?.filters }).then(sendResponse);
				break;
			}
			case BACKGROUND_ACTIONS.ADD_CHARACTER: {
				addCharacter(message.data).then(sendResponse);
				break;
			}
			default:
				console.error(`Unknown action: ${message.action}`);
		}

		return true;
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
		const context = await browser.tabs.sendMessage(tab.id, {
			action: CONTENT_ACTIONS.PROMPT,
		});

		// hardcode
		const novelId = "novel-1";
		await addCharacter({ name, context, novelId });

		await browser.tabs.sendMessage(tab.id, {
			action: CONTENT_ACTIONS.TOAST,
			data: `Added ${name}!`,
		});
	});
});
