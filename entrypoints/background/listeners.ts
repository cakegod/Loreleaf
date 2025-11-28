import {
  charactersStore,
  currentNovelIdStore,
  novelsStore,
} from "@/utils/stores";
import { BACKGROUND_ACTIONS } from "@/utils/actions";
import type { ProtocolMap } from "webext-bridge";
import { onMessage } from "webext-bridge/background";

// TODO: actually handle the errors
function onMessageWithErrorHandling<K extends keyof ProtocolMap>(
  action: K,
  // oxlint-disable-next-line no-explicit-any
  handler: Parameters<typeof onMessage<any, K>>[1],
): void {
  onMessage(action, async (message) => {
    try {
      return await handler(message);
    } catch (error) {
      console.error(`${action} failed:`, error);
      throw error;
    }
  });
}

function registerCharacterListeners(): void {
  onMessageWithErrorHandling(
    BACKGROUND_ACTIONS.REMOVE_CHARACTER,
    ({ data: characterId }) => {
      return charactersStore.remove(characterId);
    },
  );

  onMessageWithErrorHandling(
    BACKGROUND_ACTIONS.REMOVE_MANY_CHARACTERS,
    ({ data: characterIds }) => {
      return charactersStore.removeMany(characterIds);
    },
  );

  onMessageWithErrorHandling(
    BACKGROUND_ACTIONS.UPDATE_CHARACTER,
    ({ data: { characterId, characterChanges } }) => {
      return charactersStore.update(characterId, characterChanges);
    },
  );

  onMessageWithErrorHandling(
    BACKGROUND_ACTIONS.GET_CHARACTERS,
    async ({ data }) => {
      switch (data.scope) {
        case "all": {
          return await charactersStore.get();
        }
        case "byNovelId": {
          return await charactersStore.select((cs) =>
            cs.filter((c) => c.novelId === data.novelId),
          );
        }
        case "selected": {
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
    },
  );

  onMessageWithErrorHandling(BACKGROUND_ACTIONS.ADD_CHARACTER, ({ data }) => {
    return charactersStore.create(data);
  });
}

function registerNovelListeners(): void {
  onMessageWithErrorHandling(BACKGROUND_ACTIONS.GET_NOVELS, () => {
    return novelsStore.get();
  });

  onMessageWithErrorHandling(BACKGROUND_ACTIONS.ADD_NOVEL, ({ data }) => {
    return novelsStore.create(data);
  });

  onMessageWithErrorHandling(
    BACKGROUND_ACTIONS.REMOVE_NOVEL,
    ({ data: novelId }) => {
      charactersStore
        .select((characters) => {
          const charactersIds = [];

          for (const character of characters) {
            if (character.novelId === novelId) {
              charactersIds.push(character.id);
            }
          }

          return charactersIds;
        })
        .then(charactersStore.removeMany);

      return novelsStore.remove(novelId);
    },
  );

  onMessageWithErrorHandling(
    BACKGROUND_ACTIONS.UPDATE_NOVEL,
    ({ data: { novelId, novelChanges } }) => {
      return novelsStore.update(novelId, novelChanges);
    },
  );
}

function registerCurrentNovelListeners(): void {
  onMessageWithErrorHandling(
    BACKGROUND_ACTIONS.SET_SELECTED_NOVEL,
    ({ data: novelId }) => {
      return currentNovelIdStore.set(novelId);
    },
  );

  onMessageWithErrorHandling(BACKGROUND_ACTIONS.GET_SELECTED_NOVEL, () => {
    return currentNovelIdStore.get();
  });
}

export function registerMessageListeners(): void {
  registerCharacterListeners();
  registerNovelListeners();
  registerCurrentNovelListeners();
}
