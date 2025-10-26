import { ProtocolWithReturn } from "webext-bridge";

declare module "webext-bridge" {
	export interface ProtocolMap {
		[BACKGROUND_ACTIONS.GET_CHARACTERS]: ProtocolWithReturn<
			{ novelId?: string; currentNovelOnly?: boolean },
			Character[]
		>;
		[BACKGROUND_ACTIONS.ADD_CHARACTER]: ProtocolWithReturn<
			Character,
			Character[]
		>;
		[CONTENT_ACTIONS.PROMPT]: ProtocolWithReturn<null, string | null>;
		[CONTENT_ACTIONS.TOAST]: string;
		[CONTENT_ACTIONS.CHARACTERS_CHANGED]: Character[];
	}
}
