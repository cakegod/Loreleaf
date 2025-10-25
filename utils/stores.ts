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

export const novelsStore = storage.defineItem<Record<string, Novel>>(
	"local:novels",
	{
		fallback: {},
	},
);

export const relationshipsStore = storage.defineItem<
	Record<string, Relationship>
>("local:relationships", {
	fallback: {},
});

function createStorageStore<
	TValue,
	TAction extends { type: string },
	TMetadata extends Record<string, unknown> = {},
>(
	storage: WxtStorageItem<TValue | null, TMetadata>,
	reducer: (value: TValue, action: TAction) => TValue,
) {
	async function dispatch(action: TAction): Promise<TValue> {
		const value = await storage.getValue();
		if (!value) {
			throw new Error("Storage value is null or undefined");
		}
		const nextState = reducer(value, action);
		await storage.setValue(nextState);
		return nextState;
	}

	return {
		dispatch,
	};
}

export const charactersStore = createStorageStore(
	storage.defineItem<Record<string, Character>>("local:characters", {
		fallback: {},
	}),
	(
		state: Record<string, Character>,
		action:
			| {
					type: typeof BACKGROUND_ACTIONS.ADD_CHARACTER;
					payload: Omit<Character, "id">;
			  }
			| {
					type: typeof BACKGROUND_ACTIONS.UPDATE_CHARACTER;
					payload: Partial<Omit<Character, "id">> & Pick<Character, "id">;
			  }
			| {
					type: typeof BACKGROUND_ACTIONS.GET_CHARACTERS;
					payload: { novelId: string | null };
			  },
	): Record<string, Character> => {
		switch (action.type) {
			case BACKGROUND_ACTIONS.ADD_CHARACTER: {
				const id = crypto.randomUUID();
				return {
					...state,
					[id]: { id, ...action.payload },
				};
			}
			case BACKGROUND_ACTIONS.UPDATE_CHARACTER: {
				return {
					...state,
					[action.payload.id]: {
						...state[action.payload.id],
						...action.payload,
					},
				};
			}
			case BACKGROUND_ACTIONS.GET_CHARACTERS: {
				const charactersArray = Object.values(state);
				return action.payload.novelId !== null
					? charactersArray.reduce((acc: Record<string, Character>, c) => {
							if (c.novelId === action.payload.novelId) {
								acc[c.id] = c;
							}

							return acc;
					  }, {})
					: state;
			}
			default: {
				throw new Error("invalid type");
			}
		}
	},
);
