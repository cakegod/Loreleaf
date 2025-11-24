import { charactersStore, currentNovelIdStore } from "@/utils/stores";
import { CONTENT_ACTIONS } from "@/utils/actions";
import { registerMessageListeners } from "./listeners";
import { sendMessage } from "webext-bridge/background";

export default defineBackground(() => {
  registerMessageListeners();

  browser.runtime.onInstalled.addListener(() => {
    charactersStore.subscribe(async () => {
      const [tab] = await browser.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      const currentNovelId = await currentNovelIdStore.get();
      await sendMessage(
        CONTENT_ACTIONS.CHARACTERS_CHANGED,
        await charactersStore.select((cs) =>
          cs.filter((c) => c.novelId === currentNovelId),
        ),
        `content-script@${tab.id}`,
      );
    });

    currentNovelIdStore.subscribe(async (currentNovelId) => {
      const [tab] = await browser.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });

      /**
       * TODO: check the above
       * 1. not sure about using this message action. It's the same used as if the character has been added
       * 2. this duplicates some of the logic of onMessage GET_CHARACTERS
       */
      await sendMessage(
        CONTENT_ACTIONS.CHARACTERS_CHANGED,
        await charactersStore.select((cs) =>
          cs.filter((c) => c.novelId === currentNovelId),
        ),
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
    if (!tab?.id || !info.selectionText) {
      return;
    }

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
