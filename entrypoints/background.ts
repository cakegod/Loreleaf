import { store } from "~/utils/store";

export default defineBackground(() => {
	browser.runtime.onMessage.addListener(
		async (message, _sender, sendResponse) => {
			console.log(message);
			const data = await browser.storage.local.get("hello");
			sendResponse(data);
		},
	);

	browser.runtime.onInstalled.addListener(() => {
		browser.contextMenus.create({
			title: "selected",
			contexts: ["selection"],
			id: "selection",
		});
	});

	browser.contextMenus.onClicked.addListener(async (info, tab) => {
		if (tab?.id === undefined) {
			throw Error(`Could not get tab ID for ${info}`);
		}

		const characterName = info.selectionText?.trim();

		const storeValue = await store.getValue();
		if (storeValue.some((c) => c.name === characterName)) {
			await browser.tabs.sendMessage(tab.id, {
				action: "ALERT",
				data: `${characterName} already exists!`,
			});
			return;
		}

		const context = await browser.tabs.sendMessage(tab.id, {
			action: "PROMPT",
		});

		store.setValue([
			...storeValue,
			{
				name: characterName!,
				context,
			},
		]);

		await browser.tabs.sendMessage(tab.id, {
			action: "ALERT",
			data: "success",
		});
	});
});
