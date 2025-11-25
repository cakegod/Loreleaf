import type { ProtocolWithReturn } from "webext-bridge";

declare module "webext-bridge" {
  export interface ProtocolMap {
    // Characters
    [BACKGROUND_ACTIONS.GET_CHARACTERS]: ProtocolWithReturn<
      | { type: "all" }
      | { type: "current" }
      | { type: "id"; novelId: Novel["id"] },
      Character[]
    >;
    [BACKGROUND_ACTIONS.ADD_CHARACTER]: ProtocolWithReturn<
      Omit<Character, "id">,
      Character
    >;
    [BACKGROUND_ACTIONS.UPDATE_CHARACTER]: ProtocolWithReturn<
      {
        characterId: Character["id"];
        characterChanges: CharacterChanges;
      },
      Character
    >;
    [BACKGROUND_ACTIONS.REMOVE_CHARACTER]: ProtocolWithReturn<
      Character["id"],
      Character
    >;

    [BACKGROUND_ACTIONS.REMOVE_MANY_CHARACTERS]: ProtocolWithReturn<
      Character["id"][],
      Character[]
    >;

    // Novels
    [BACKGROUND_ACTIONS.GET_NOVELS]: ProtocolWithReturn<unknown, Novel[]>;
    [BACKGROUND_ACTIONS.ADD_NOVEL]: ProtocolWithReturn<
      Omit<Novel, "id">,
      Novel
    >;
    [BACKGROUND_ACTIONS.REMOVE_NOVEL]: ProtocolWithReturn<Novel["id"], Novel>;
    [BACKGROUND_ACTIONS.UPDATE_NOVEL]: ProtocolWithReturn<
      {
        novelId: Novel["id"];
        novelChanges: NovelChanges;
      },
      Novel
    >;

    // Current novel
    [BACKGROUND_ACTIONS.GET_CURRENT_NOVEL]: ProtocolWithReturn<
      unknown,
      Novel["id"]
    >;
    [BACKGROUND_ACTIONS.SET_CURRENT_NOVEL]: ProtocolWithReturn<
      Novel["id"],
      Novel["id"]
    >;
    [CONTENT_ACTIONS.PROMPT]: ProtocolWithReturn<string, string>;
    [CONTENT_ACTIONS.TOAST]: string;
    [CONTENT_ACTIONS.CHARACTERS_CHANGED]: Character[];
  }
}
