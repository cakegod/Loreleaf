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
      Character,
      Character
    >;
    [BACKGROUND_ACTIONS.UPDATE_CHARACTER]: ProtocolWithReturn<
      {
        characterId: Character["id"];
        characterChanges: Omit<Partial<Character>, "id">;
      },
      Character[]
    >;
    [BACKGROUND_ACTIONS.REMOVE_CHARACTER]: ProtocolWithReturn<
      Character["id"],
      Character[]
    >;

    // Current novel
    [BACKGROUND_ACTIONS.GET_CURRENT_NOVEL]: ProtocolWithReturn<
      null,
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
