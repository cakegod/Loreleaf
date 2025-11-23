import type { Character, Novel } from "@/utils/stores";
import { sendMessage } from "webext-bridge/popup";

const API = {
  getCurrentCharacters(): Promise<Character[]> {
    return sendMessage(
      BACKGROUND_ACTIONS.GET_CHARACTERS,
      { type: "current" },
      "background",
    );
  },
  getCurrentNovelId(): Promise<Novel["id"]> {
    return sendMessage(BACKGROUND_ACTIONS.GET_CURRENT_NOVEL, {}, "background");
  },
  getNovels(): Promise<Novel[]> {
    return sendMessage(BACKGROUND_ACTIONS.GET_NOVELS, {}, "background");
  },
  setCurrentNovel(novelId: string): Promise<Novel["id"]> {
    return sendMessage(
      BACKGROUND_ACTIONS.SET_CURRENT_NOVEL,
      novelId,
      "background",
    );
  },
  addNovel(title: Novel["title"]): Promise<Novel> {
    return sendMessage(BACKGROUND_ACTIONS.ADD_NOVEL, { title }, "background");
  },
  addCharacter(data: Omit<Character, "id">): Promise<Character> {
    return sendMessage(BACKGROUND_ACTIONS.ADD_CHARACTER, data, "background");
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

  async addNovel(title: Novel["title"]): Promise<void> {
    await this.#exec(async () => {
      const newNovel = await API.addNovel(title);

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

  async addCharacter(data: Omit<Character, "id" | "novelId">): Promise<void> {
    await this.#exec(async () => {
      const novelId = await API.getCurrentNovelId();
      await API.addCharacter({
        ...data,
        novelId,
      });

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
}
