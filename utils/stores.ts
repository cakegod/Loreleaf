import { BACKGROUND_ACTIONS } from "@/utils/actions";

export interface Novel {
	id: string;
	title: string;
	author?: string;
	notes?: string;
}

export interface Character {
	id: string;
	name: string;
	aliases?: string[];
	novelId: string;
	context: string;
}

export interface Relationship {
	id: string;
	fromId: string;
	toId: string;
	type: string;
	notes?: string;
}

// export const novelsStore = storage.defineItem<Novel[]>("local:novels", {
// 	fallback: [],
// });

// export const relationshipsStore = storage.defineItem<Relationship[]>(
// 	"local:relationships",
// 	{
// 		fallback: [],
// 	},
// );

function createStorageStore<
	TValue,
	TAction extends { type: string },
	TMetadata extends Record<string, unknown> = {},
>(
	storage: WxtStorageItem<TValue, TMetadata>,
	reducer: (value: TValue, action: TAction) => TValue,
) {
	async function dispatch(action: TAction): Promise<TValue> {
		const value = await storage.getValue();
		if (value === undefined) {
			throw new Error("Storage value is undefined");
		}
		const nextState = reducer(value, action);
		await storage.setValue(nextState);
		return nextState;
	}

	function getState(): Promise<TValue> {
		return storage.getValue();
	}

	async function select<TResult>(selector: (state: TValue) => TResult) {
		const state = await storage.getValue();
		return selector(state);
	}

	return {
		dispatch,
		getState,
		select,
		subscribe: storage.watch,
	};
}

export const charactersStore = createStorageStore(
	storage.defineItem<Character[]>("local:characters", {
		fallback: [],
	}),
	(
		characters: Character[],
		action:
			| {
					type: typeof BACKGROUND_ACTIONS.ADD_CHARACTER;
					payload: Omit<Character, "id">;
			  }
			| {
					type: typeof BACKGROUND_ACTIONS.UPDATE_CHARACTER;
					payload: Character;
			  }
			| {
					type: typeof BACKGROUND_ACTIONS.REMOVE_CHARACTER;
					payload: {
						id: Character["id"];
					};
			  },
	): Character[] => {
		switch (action.type) {
			case BACKGROUND_ACTIONS.ADD_CHARACTER: {
				const id = crypto.randomUUID();
				return [
					...characters,
					{
						...action.payload,
						id,
					},
				];
			}
			case BACKGROUND_ACTIONS.UPDATE_CHARACTER: {
				return characters.map((c) =>
					c.id === action.payload.id
						? {
								...action.payload,
						  }
						: c,
				);
			}
			case BACKGROUND_ACTIONS.REMOVE_CHARACTER: {
				return characters.filter((c) => c.id !== action.payload.id);
			}
			default: {
				throw new Error("invalid type");
			}
		}
	},
);

export const currentNovelIdStore = createStorageStore(
	storage.defineItem<string>("local:currentNovel", { fallback: "" }),
	(
		_currentNovel: string,
		action: {
			type: typeof BACKGROUND_ACTIONS.SET_CURRENT_NOVEL;
			payload: string;
		},
	): string => {
		switch (action.type) {
			case BACKGROUND_ACTIONS.SET_CURRENT_NOVEL: {
				return action.payload;
			}
			default:
				throw new Error("invalid type");
		}
	},
);
