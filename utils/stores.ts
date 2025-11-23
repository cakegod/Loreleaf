// oxlint-disable explicit-function-return-type
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

  function get(): Promise<Character[]> {
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

  async function removeMany(ids: Character["id"][]): Promise<Character[]> {
    const characters = await _storage.getValue();
    const newCharacters = characters.filter((c) => !ids.includes(c.id));
    await _storage.setValue(newCharacters);
    return newCharacters;
  }

  async function select<R>(
    selector: (storageValue: Character[]) => R,
  ): Promise<R> {
    const storageValue = await _storage.getValue();
    return selector(storageValue);
  }

  return {
    get,
    create,
    update,
    remove,
    removeMany,
    select,
    subscribe: _storage.watch,
  };
})();

export const currentNovelIdStore = (() => {
  const _storage = storage.defineItem<Novel["id"]>("local:currentNovel", {
    fallback: "",
  });

  function get(): Promise<Novel["id"]> {
    return _storage.getValue();
  }

  async function set(value: Novel["id"]): Promise<Novel["id"]> {
    await _storage.setValue(value);
    return get();
  }

  return { subscribe: _storage.watch, get, set };
})();

export const novelsStore = (() => {
  const _storage = storage.defineItem<Novel[]>("local:novels", {
    fallback: [],
  });

  function get(): Promise<Novel[]> {
    return _storage.getValue();
  }

  async function set(value: Novel[]): Promise<Novel[]> {
    await _storage.setValue(value);
    return get();
  }

  async function create(novel: Omit<Novel, "id">): Promise<Novel> {
    const newNovel = { ...novel, id: crypto.randomUUID() };
    const novels = await _storage.getValue();
    await _storage.setValue([...novels, newNovel]);
    return newNovel;
  }

  async function update(
    id: Novel["id"],
    novelChanges: Omit<Partial<Novel>, "id">,
  ): Promise<Novel[]> {
    const novels = await _storage.getValue();
    await _storage.setValue(
      novels.map((n) => (n.id === id ? { ...n, ...novelChanges } : n)),
    );
    return novels;
  }

  async function remove(id: Novel["id"]): Promise<Novel[]> {
    const novels = await _storage.getValue();
    const newNovels = novels.filter((n) => n.id !== id);
    await _storage.setValue(newNovels);
    return newNovels;
  }

  async function select<R>(selector: (storageValue: Novel[]) => R): Promise<R> {
    const storageValue = await _storage.getValue();
    return selector(storageValue);
  }

  return {
    subscribe: _storage.watch,
    get,
    set,
    create,
    update,
    remove,
    select,
  };
})();
