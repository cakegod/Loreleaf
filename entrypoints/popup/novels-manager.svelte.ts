// oxlint-disable explicit-function-return-type
import type {
  Character,
  CharacterChanges,
  Novel,
  NovelChanges,
} from "@/utils/stores";
import { sendMessage } from "webext-bridge/popup";

// the return types are inferred
const API = {
  getSelectedNovelCharacters() {
    return sendMessage(
      BACKGROUND_ACTIONS.GET_CHARACTERS,
      { scope: "selected" },
      "background",
    );
  },
  getCharactersFromNovelId(novelId: Novel["id"]) {
    return sendMessage(
      BACKGROUND_ACTIONS.GET_CHARACTERS,
      { scope: "byNovelId", novelId },
      "background",
    );
  },
  getSelectedNovelId() {
    return sendMessage(BACKGROUND_ACTIONS.GET_SELECTED_NOVEL, {}, "background");
  },
  getAllNovels() {
    return sendMessage(BACKGROUND_ACTIONS.GET_NOVELS, {}, "background");
  },
  setSelectedNovelId(novelId: string) {
    return sendMessage(
      BACKGROUND_ACTIONS.SET_SELECTED_NOVEL,
      novelId,
      "background",
    );
  },
  addNovel(data: Omit<Novel, "id">) {
    return sendMessage(BACKGROUND_ACTIONS.ADD_NOVEL, data, "background");
  },
  updateNovel(novelId: Novel["id"], novelChanges: NovelChanges) {
    return sendMessage(
      BACKGROUND_ACTIONS.UPDATE_NOVEL,
      { novelId, novelChanges },
      "background",
    );
  },
  removeNovel(id: Novel["id"]) {
    return sendMessage(BACKGROUND_ACTIONS.REMOVE_NOVEL, id, "background");
  },
  addCharacter(data: Omit<Character, "id">) {
    return sendMessage(BACKGROUND_ACTIONS.ADD_CHARACTER, data, "background");
  },
  updateCharacter(
    characterId: Character["id"],
    characterChanges: CharacterChanges,
  ) {
    return sendMessage(
      BACKGROUND_ACTIONS.UPDATE_CHARACTER,
      { characterId, characterChanges },
      "background",
    );
  },
  removeCharacter(id: Character["id"]) {
    return sendMessage(BACKGROUND_ACTIONS.REMOVE_CHARACTER, id, "background");
  },
  removeManyCharacters(ids: Character["id"][]) {
    return sendMessage(
      BACKGROUND_ACTIONS.REMOVE_MANY_CHARACTERS,
      ids,
      "background",
    );
  },
};

type ReadyState = {
  novels: Novel[];
  selectedNovelId: Novel["id"];
  selectedNovelCharacters: Character[];
  status: "ready";
};

// TODO: during loading there can be or not data
type LoadingState = {
  novels: Novel[];
  selectedNovelId: Novel["id"];
  selectedNovelCharacters: Character[];
  status: "loading";
};

type InitializingState = {
  status: "initializing";
};

type ErrorState = {
  status: "error";
  errorMessage: string;
};

type NovelsState = ReadyState | LoadingState | InitializingState | ErrorState;
type ReadyStateUpdate = Partial<Omit<ReadyState, "status">>;

// fancy type to check excessive props
// related discussion: https://stackoverflow.com/questions/58864033/in-typescript-is-there-a-way-to-restrict-extra-excess-properties-for-a-partial
type Exactly<T> = T & {
  [K in keyof T as K extends keyof ReadyStateUpdate ? never : K]: never;
};

export class NovelsManager {
  state = $state<NovelsState>({
    status: "initializing",
  });

  async #runWithLoading<T extends ReadyStateUpdate>(
    fn: () => Promise<Exactly<T>>,
  ): Promise<void> {
    if (
      this.state.status === "loading" ||
      this.state.status === "initializing" ||
      this.state.status === "error"
    ) {
      return;
    }

    this.state = { ...this.state, status: "loading" };

    try {
      const result = await fn();
      this.state = { ...this.state, ...result, status: "ready" };
    } catch (error) {
      this.state = {
        ...this.state,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  init = async (): Promise<void> => {
    try {
      const [novels, selectedNovelId, selectedNovelCharacters] =
        await Promise.all([
          API.getAllNovels(),
          API.getSelectedNovelId(),
          API.getSelectedNovelCharacters(),
        ]);

      this.state = {
        novels,
        selectedNovelId,
        selectedNovelCharacters,
        status: "ready",
      };
    } catch (error) {
      this.state = {
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  addNovel = async (data: Omit<Novel, "id">): Promise<void> => {
    await this.#runWithLoading(async () => {
      const newNovel = await API.addNovel(data);

      await API.setSelectedNovelId(newNovel.id);

      const [novels, selectedNovelCharacters] = await Promise.all([
        API.getAllNovels(),
        API.getSelectedNovelCharacters(),
      ]);

      return {
        novels,
        selectedNovelCharacters,
        selectedNovelId: newNovel.id,
      };
    });
  };

  removeNovel = async (novelId: Novel["id"]): Promise<void> => {
    await this.#runWithLoading(async () => {
      await Promise.all([API.removeNovel(novelId), API.setSelectedNovelId("")]);

      const [selectedNovelId, selectedNovelCharacters, novels] =
        await Promise.all([
          API.getSelectedNovelId(),
          API.getSelectedNovelCharacters(),
          API.getAllNovels(),
        ]);

      return {
        selectedNovelId,
        selectedNovelCharacters,
        novels,
      };
    });
  };

  addCharacter = async (
    data: Omit<Character, "id" | "novelId">,
  ): Promise<void> => {
    await this.#runWithLoading(async () => {
      const currentNovelId = await API.getSelectedNovelId();
      await API.addCharacter({
        ...data,
        novelId: currentNovelId,
      });

      const selectedNovelCharacters = await API.getSelectedNovelCharacters();

      return {
        selectedNovelCharacters,
      };
    });
  };

  updateCharacter = async (
    id: Character["id"],
    characterChanges: CharacterChanges,
  ): Promise<void> => {
    await this.#runWithLoading(async () => {
      await API.updateCharacter(id, characterChanges);
      const selectedNovelCharacters = await API.getSelectedNovelCharacters();

      return {
        selectedNovelCharacters,
      };
    });
  };

  removeCharacter = async (id: Character["id"]): Promise<void> => {
    await this.#runWithLoading(async () => {
      await API.removeCharacter(id);
      const selectedNovelCharacters = await API.getSelectedNovelCharacters();

      return {
        selectedNovelCharacters,
      };
    });
  };

  setSelectedNovel = async (novelId: Novel["id"]): Promise<void> => {
    await this.#runWithLoading(async () => {
      await API.setSelectedNovelId(novelId);

      const [selectedNovelCharacters, selectedNovelId] = await Promise.all([
        API.getSelectedNovelCharacters(),
        API.getSelectedNovelId(),
      ]);

      return {
        selectedNovelId,
        selectedNovelCharacters,
      };
    });
  };

  updateNovel = async (
    id: Novel["id"],
    novelChanges: NovelChanges,
  ): Promise<void> => {
    await this.#runWithLoading(async () => {
      await API.updateNovel(id, novelChanges);
      const novels = await API.getAllNovels();

      return {
        novels,
      };
    });
  };
}
