import {
  charactersStore,
  currentNovelIdStore,
  novelsStore,
} from "@/utils/stores";
import { BACKGROUND_ACTIONS } from "@/utils/actions";
import { onMessage } from "webext-bridge/background";

// TODO: actually handle the errors

function registerCharacterListeners(): void {
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
    BACKGROUND_ACTIONS.REMOVE_MANY_CHARACTERS,
    async ({ data: characterIds }) => {
      try {
        return await charactersStore.removeMany(characterIds);
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

function registerNovelListeners(): void {
  onMessage(BACKGROUND_ACTIONS.GET_NOVELS, async () => {
    try {
      return await novelsStore.get();
    } catch (error) {
      console.error("GET_NOVELS failed:", error);
      throw error;
    }
  });

  onMessage(BACKGROUND_ACTIONS.ADD_NOVEL, async ({ data }) => {
    try {
      return await novelsStore.create(data);
    } catch (error) {
      console.error("ADD_NOVEL failed:", error);
      throw error;
    }
  });

  onMessage(BACKGROUND_ACTIONS.REMOVE_NOVEL, async ({ data: novelId }) => {
    try {
      return await novelsStore.remove(novelId);
    } catch (error) {
      console.error("GET_CURRENT_NOVEL failed:", error);
      throw error;
    }
  });

  onMessage(
    BACKGROUND_ACTIONS.UPDATE_NOVEL,
    async ({ data: { novelId, novelChanges } }) => {
      try {
        return await novelsStore.update(novelId, novelChanges);
      } catch (error) {
        console.error("UPDATE_CHARACTER failed:", error);
        throw error;
      }
    },
  );
}

function registerCurrentNovelListeners(): void {
  onMessage(BACKGROUND_ACTIONS.SET_CURRENT_NOVEL, async ({ data: novelId }) => {
    try {
      console.log("SET", novelId);
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
}

export function registerMessageListeners(): void {
  registerCharacterListeners();
  registerNovelListeners();
  registerCurrentNovelListeners();
}
