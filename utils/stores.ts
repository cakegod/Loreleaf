import type { WatchCallback } from "wxt/utils/storage";

export interface Novel {
  id: string;
  title: string;
  author?: string;
  description: string;
}

export type NovelChanges = Omit<Partial<Novel>, "id">;

export interface Character {
  id: string;
  name: string;
  aliases?: string[];
  novelId: string;
  note: string;
}

export type CharacterChanges = Omit<Partial<Character>, "id" | "novelId">;

interface CRUDStore<T extends { id: string }, TChanges> {
  get(): Promise<T[]>;
  create(item: Omit<T, "id">): Promise<T>;
  update(id: string, changes: TChanges): Promise<T>;
  remove(id: string): Promise<T>;
  removeMany(ids: string[]): Promise<T[]>;
  select<R>(selector: (items: T[]) => R): Promise<R>;
  subscribe(callback: WatchCallback<T[]>): () => void;
}

interface ValueStore<T> {
  get(): Promise<T>;
  set(value: T): Promise<T>;
  subscribe(callback: WatchCallback<T>): () => void;
}

function createCRUDStore<T extends { id: string }, TChanges>(
  storageKey: StorageItemKey,
): CRUDStore<T, TChanges> {
  const _storage = storage.defineItem<T[]>(storageKey, {
    fallback: [],
  });
  return {
    get() {
      return _storage.getValue();
    },

    async create(item) {
      const newItem = { ...item, id: crypto.randomUUID() } as T;
      const items = await _storage.getValue();
      await _storage.setValue([...items, newItem]);
      return newItem;
    },

    async update(id, changes) {
      const items = await _storage.getValue();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error("Item not found");
      }
      const updatedItem = { ...items[index], ...changes };
      const updatedItems = [...items];
      updatedItems[index] = updatedItem;
      await _storage.setValue(updatedItems);
      return updatedItem;
    },

    async remove(id) {
      const items = await _storage.getValue();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error("Item not found");
      }
      const removedItem = items[index];
      const newItems = items.filter((item) => item.id !== id);
      await _storage.setValue(newItems);
      return removedItem;
    },

    async removeMany(ids) {
      const items = await _storage.getValue();
      const removedItems = items.filter((item) => ids.includes(item.id));
      const newItems = items.filter((item) => !ids.includes(item.id));
      await _storage.setValue(newItems);
      return removedItems;
    },

    async select(selector) {
      const items = await _storage.getValue();
      return selector(items);
    },

    subscribe: _storage.watch,
  };
}

function createValueStore<T>(
  storageKey: StorageItemKey,
  fallback: T,
): ValueStore<T> {
  const _storage = storage.defineItem<T>(storageKey, {
    fallback,
  });

  return {
    get() {
      return _storage.getValue();
    },

    async set(value) {
      await _storage.setValue(value);
      return value;
    },

    subscribe: _storage.watch,
  };
}

export const charactersStore = createCRUDStore<Character, CharacterChanges>(
  "local:characters",
);
export const novelsStore = createCRUDStore<Novel, NovelChanges>("local:novels");
export const currentNovelIdStore = createValueStore<Novel["id"]>(
  "local:currentNovel",
  "",
);
