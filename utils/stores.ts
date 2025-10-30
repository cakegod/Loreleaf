export interface Novel {
	id: string;
	title: string;
	author?: string;
	description?: string;
}

export interface Character {
	id: string;
	name: string;
	aliases?: string[];
	novelId: string;
	note: string;
}

export interface Relationship {
	id: string;
	fromId: string;
	toId: string;
	type: string;
	description?: string;
}

export const charactersStore = (() => {
	const _storage = storage.defineItem<Character[]>("local:characters", {
		fallback: [],
	});

	async function get(): Promise<Character[]> {
		return _storage.getValue();
	}

	async function create(character: Omit<Character, "id">): Promise<Character> {
		const newCharacter = { ...character, id: crypto.randomUUID() };
		const characters = await _storage.getValue();
		await _storage.setValue([...characters, newCharacter]);
		return newCharacter;
	}

	async function update(
		id: Character["id"],
		characterChanges: Omit<Partial<Character>, "id">,
	): Promise<Character[]> {
		const characters = await _storage.getValue();
		await _storage.setValue(
			characters.map((c) => (c.id === id ? { ...c, ...characterChanges } : c)),
		);
		return characters;
	}

	async function remove(id: Character["id"]): Promise<Character[]> {
		const characters = await _storage.getValue();
		const newCharacters = characters.filter((c) => c.id !== id);
		await _storage.setValue(newCharacters);
		return newCharacters;
	}

	async function select<R>(selector: (storageValue: Character[]) => R) {
		const storageValue = await _storage.getValue();
		return selector(storageValue);
	}

	return { get, create, update, remove, select, subscribe: _storage.watch };
})();

export const currentNovelIdStore = (() => {
	const _storage = storage.defineItem<Novel["id"]>("local:currentNovel", {
		fallback: "",
	});

	function get() {
		return _storage.getValue();
	}

	async function set(value: Novel["id"]) {
		await _storage.setValue(value);
		return get();
	}

	return { subscribe: _storage.watch, get, set };
})();
