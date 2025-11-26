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
  getCurrentCharacters() {
    return sendMessage(
      BACKGROUND_ACTIONS.GET_CHARACTERS,
      { scope: "current" },
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
  getCurrentNovelId() {
    return sendMessage(BACKGROUND_ACTIONS.GET_CURRENT_NOVEL, {}, "background");
  },
  getNovels() {
    return sendMessage(BACKGROUND_ACTIONS.GET_NOVELS, {}, "background");
  },
  setCurrentNovel(novelId: string) {
    return sendMessage(
      BACKGROUND_ACTIONS.SET_CURRENT_NOVEL,
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

type IdleState = {
  novels: Novel[];
  currentNovelId: Novel["id"];
  characters: Character[];
  status: "idle";
};

// TODO: during loading there can be or not data
type LoadingState = {
  novels: Novel[];
  currentNovelId: Novel["id"];
  characters: Character[];
  status: "loading";
};

type InitializingState = {
  status: "initializing";
};

type ErrorState = {
  status: "error";
  errorMessage: string;
};

type NovelsState = IdleState | LoadingState | InitializingState | ErrorState;

export class NovelsManager {
  state = $state<NovelsState>({
    status: "initializing",
  });

  async #exec(fn: () => Promise<Partial<NovelsState>>): Promise<void> {
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
      this.state = { ...this.state, ...result, status: "idle" };
    } catch (error) {
      this.state = {
        ...this.state,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async init(): Promise<void> {
    const [novels, currentNovelId, characters] = await Promise.all([
      API.getNovels(),
      API.getCurrentNovelId(),
      API.getCurrentCharacters(),
    ]);

    this.state = {
      novels,
      currentNovelId,
      characters,
      status: "idle",
    };
  }

  async addNovel(data: Omit<Novel, "id">): Promise<void> {
    await this.#exec(async () => {
      const newNovel = await API.addNovel(data);

      await API.setCurrentNovel(newNovel.id);

      const [novels, characters] = await Promise.all([
        API.getNovels(),
        API.getCurrentCharacters(),
      ]);

      return {
        novels,
        characters,
        currentNovelId: newNovel.id,
      };
    });
  }

  async removeNovel(novelId: Novel["id"]): Promise<void> {
    await this.#exec(async () => {
      const charactersIds = await API.getCharactersFromNovelId(novelId).then(
        (characters) => characters.map((c) => c.id),
      );

      await Promise.all([
        API.removeManyCharacters(charactersIds),
        API.removeNovel(novelId),
        API.setCurrentNovel(""),
      ]);

      const [currentNovelId, characters, novels] = await Promise.all([
        API.getCurrentNovelId(),
        API.getCurrentCharacters(),
        API.getNovels(),
      ]);
      return {
        currentNovelId,
        characters,
        novels,
      };
    });
  }

  async addCharacter(data: Omit<Character, "id" | "novelId">): Promise<void> {
    await this.#exec(async () => {
      const currentNovelId = await API.getCurrentNovelId();
      await API.addCharacter({
        ...data,
        novelId: currentNovelId,
      });

      const characters = await API.getCurrentCharacters();
      return {
        ...this.state,
        characters,
      };
    });
  }

  async updateCharacter(
    id: Character["id"],
    characterChanges: CharacterChanges,
  ): Promise<void> {
    await this.#exec(async () => {
      await API.updateCharacter(id, characterChanges);
      const characters = await API.getCurrentCharacters();
      return {
        characters,
      };
    });
  }

  async removeCharacter(id: Character["id"]): Promise<void> {
    await this.#exec(async () => {
      await API.removeCharacter(id);
      const characters = await API.getCurrentCharacters();
      return {
        ...this.state,
        characters,
      };
    });
  }

  async setCurrentNovel(novelId: Novel["id"]): Promise<void> {
    await this.#exec(async () => {
      await API.setCurrentNovel(novelId);

      const [characters, currentNovelId] = await Promise.all([
        API.getCurrentCharacters(),
        API.getCurrentNovelId(),
      ]);
      return {
        currentNovelId,
        characters,
      };
    });
  }

  async updateNovel(
    id: Novel["id"],
    novelChanges: NovelChanges,
  ): Promise<void> {
    await this.#exec(async () => {
      await API.updateNovel(id, novelChanges);
      const novels = await API.getNovels();
      return {
        ...this.state,
        novels,
      };
    });
  }
}
