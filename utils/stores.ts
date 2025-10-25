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

export const charactersStore = storage.defineItem<Record<string, Character>>(
	"local:characters",
	{
		fallback: {},
	},
);

export const relationshipsStore = storage.defineItem<Record<string, Relationship>>(
	"local:relationships",
	{
		fallback: {},
	},
);
