import { ProtocolWithReturn } from "webext-bridge";

declare module "webext-bridge" {
	export interface ProtocolMap {
		[BACKGROUND_ACTIONS.GET_CHARACTERS]: ProtocolWithReturn<
			{ novelId?: string },
			Record<string, Character>
		>;
		[BACKGROUND_ACTIONS.ADD_CHARACTER]: ProtocolWithReturn<
			Character,
			Record<string, Character>
		>;
		[CONTENT_ACTIONS.PROMPT]: ProtocolWithReturn<null, string | null>;
		[CONTENT_ACTIONS.TOAST]: string;
	}
}
