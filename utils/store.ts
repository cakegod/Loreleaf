export const store = storage.defineItem<{ name: string; context: string }[]>(
	"local:store",
	{ fallback: [] },
);
