import { BACKGROUND_ACTIONS, CONTENT_ACTIONS } from "@/utils/actions";
import { charactersStore, currentNovelIdStore } from "@/utils/stores";
import { onMessage, sendMessage } from "webext-bridge/background";

// TODO: actually handle the errors

function registerMessageListeners(): void {
  // Current novel
  onMessage(BACKGROUND_ACTIONS.SET_CURRENT_NOVEL, async ({ data: novelId }) => {
    try {
      return await currentNovelIdStore.set(novelId);
    } catch (error) {
      console.error("SET_CURRENT_NOVEL failed:", error);
      throw error;
    }
  });

  onMessage(BACKGROUND_ACTIONS.GET_CURRENT_NOVEL, async () => {
    try {
      return await currentNovelIdStore.get();
    } catch (error) {
      console.error("GET_CURRENT_NOVEL failed:", error);
      throw error;
    }
  });

  // Characters
  onMessage(
    BACKGROUND_ACTIONS.REMOVE_CHARACTER,
    async ({ data: characterId }) => {
      try {
        return await charactersStore.remove(characterId);
      } catch (error) {
        console.error("REMOVE_CHARACTER failed:", error);
        throw error;
      }
    },
  );

  onMessage(
    BACKGROUND_ACTIONS.UPDATE_CHARACTER,
    async ({ data: { characterId, characterChanges } }) => {
      try {
        return await charactersStore.update(characterId, characterChanges);
      } catch (error) {
        console.error("UPDATE_CHARACTER failed:", error);
        throw error;
      }
    },
  );

  onMessage(BACKGROUND_ACTIONS.GET_CHARACTERS, async ({ data }) => {
    try {
      switch (data.type) {
        case "all": {
          return await charactersStore.get();
        }
        case "id": {
          return await charactersStore.select((cs) =>
            cs.filter((c) => c.novelId === data.novelId),
          );
        }
        case "current": {
          const currentNovelId = await currentNovelIdStore.get();
          return await charactersStore.select((cs) =>
            cs.filter((c) => c.novelId === currentNovelId),
          );
        }
        default: {
          console.log(`No get characters action type`);
          throw new Error("No get characters action type");
        }
      }
    } catch (error) {
      console.error("GET_CHARACTERS failed:", error);
      throw error;
    }
  });

  onMessage(BACKGROUND_ACTIONS.ADD_CHARACTER, async ({ data }) => {
    try {
      return await charactersStore.create(data);
    } catch (error) {
      console.error("ADD_CHARACTER failed:", error);
      throw error;
    }
  });
}

export default defineBackground(() => {
  registerMessageListeners();
  browser.runtime.onInstalled.addListener(() => {
    charactersStore.subscribe(async (characters) => {
      const [tab] = await browser.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      await sendMessage(
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
