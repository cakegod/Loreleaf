import { ProtocolWithReturn } from "webext-bridge";

declare module "webext-bridge" {
	export interface ProtocolMap {
		[BACKGROUND_ACTIONS.GET_CHARACTERS]: ProtocolWithReturn<
			{ novelId?: string; currentNovelOnly?: boolean },
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
		[CONTENT_ACTIONS.PROMPT]: ProtocolWithReturn<string, string>;
		[CONTENT_ACTIONS.TOAST]: string;
		[CONTENT_ACTIONS.CHARACTERS_CHANGED]: Character[];
	}
}
