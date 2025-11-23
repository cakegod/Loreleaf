import type { Character, Novel } from "@/utils/stores";
import { sendMessage } from "webext-bridge/popup";

export class NovelsManager {
  state = $state<
    | {
        status: "loading";
      }
    | {
        novels: Novel[];
        currentNovelId: Novel["id"];
        characters: Character[];
        status: "success";
      }
  >({
    status: "loading",
  });

  async init(): Promise<void> {
    const [novels, currentNovelId, characters] = await Promise.all([
      sendMessage(BACKGROUND_ACTIONS.GET_NOVELS, {}, "background"),
      sendMessage(BACKGROUND_ACTIONS.GET_CURRENT_NOVEL, {}, "background"),
      sendMessage(
        BACKGROUND_ACTIONS.GET_CHARACTERS,
        { type: "current" },
        "background",
      ),
    ]);

    this.state = {
      novels,
      currentNovelId,
      characters,
      status: "success",
    };
  }

  async addNovel(title: Novel["title"]): Promise<void> {
    if (this.state.status === "loading") {
      throw new Error("Cannot add a new novel while loading");
    }
    const newNovel = await sendMessage(
      BACKGROUND_ACTIONS.ADD_NOVEL,
      { title },
      "background",
    );

    const novels = await sendMessage(
      BACKGROUND_ACTIONS.GET_NOVELS,
      {},
      "background",
    );

    await sendMessage(
      BACKGROUND_ACTIONS.SET_CURRENT_NOVEL,
      newNovel.id,
      "background",
    );

    const characters = await sendMessage(
      BACKGROUND_ACTIONS.GET_CHARACTERS,
      { type: "current" },
      "background",
    );

    this.state = {
      ...this.state,
      novels,
      characters,
      currentNovelId: newNovel.id,
    };
  }

  async addCharacter(data: Omit<Character, "id" | "novelId">): Promise<void> {
    if (this.state.status === "loading" || !this.state.currentNovelId) {
      throw new Error(
        "Cannot add a new character without selecting a novel or while loading",
      );
    }
    await sendMessage(
      BACKGROUND_ACTIONS.ADD_CHARACTER,
      {
        name: data.name,
        note: data.note,
        novelId: this.state.currentNovelId,
      },
      "background",
    );

    const characters = await sendMessage(
      BACKGROUND_ACTIONS.GET_CHARACTERS,
      { type: "current" },
      "background",
    );
    this.state.characters = characters;
  }

  async setCurrentNovel(value: Novel["id"]): Promise<void> {
    if (this.state.status === "loading") {
      throw new Error("Cannot change current novel while loading");
    }

    await sendMessage(
      BACKGROUND_ACTIONS.SET_CURRENT_NOVEL,
      value,
      "background",
    );

    const characters = await sendMessage(
      BACKGROUND_ACTIONS.GET_CHARACTERS,
      { type: "current" },
      "background",
    );
    this.state.characters = characters;
  }
}
