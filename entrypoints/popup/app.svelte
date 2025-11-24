<script lang="ts">
	import { NovelsManager } from "./novels-manager.svelte";
	import { onMount } from "svelte";

	const manager = new NovelsManager();

	let newNovel = $state<Omit<Novel, "id">>({ title: "", description: "" });
	let newCharacter = $state({
		name: "",
		note: "",
	});

	// for type narrowing
	let managerState = $derived(manager.state);

	onMount(() => {
		manager.init();
	});

	$inspect(manager.state);
</script>

<p>Create novel</p>
<form>
	<label>
		Novel title (required)
		<input
			required
			type="text"
			name="new-novel-title"
			id="new-novel-title"
			bind:value={newNovel.title}
		/>
	</label>
	<label>
		Novel description (optional)
		<textarea
			name="new-novel-description"
			id="new-novel-description"
			bind:value={newNovel.description}
		>
		</textarea>
	</label>
	<button
		onclick={async (e) => {
			e.preventDefault();
			manager.addNovel(newNovel);
			newNovel.title = "";
		}}
	>
		Add novel
	</button>
</form>

{#if managerState.status === "loading"}
	Loading...
{:else if managerState.status === "idle"}
	<label for="current-novel">Current novel:</label>
	<select
		id="current-novel"
		value={managerState.currentNovelId}
		onchange={(e) => {
			manager.setCurrentNovel((e.target as HTMLOptionElement).value);
		}}
	>
		{#each managerState.novels as novel}
			<option
				selected={novel.id === managerState.currentNovelId}
				value={novel.id}
			>
				{novel.title}
			</option>
		{/each}
	</select>

	{#if managerState.currentNovelId}
		<button onclick={() => manager.removeNovel(managerState.currentNovelId)}>
			Remove Novel
		</button>
		<label>
			Character name
			<input
				type="text"
				name="new-character-name"
				id="new-character-name"
				bind:value={newCharacter.name}
			/>
		</label>
		<label>
			Character note
			<input
				type="text"
				name="new-character-note"
				id="new-character-note"
				bind:value={newCharacter.note}
			/>
		</label>
		<button
			onclick={async () => {
				manager.addCharacter(newCharacter);
				newCharacter = {
					name: "",
					note: "",
				};
			}}
		>
			Add character
		</button>
	{:else if managerState.novels.length === 0}
		Create a novel to add a new character
	{:else}
		Select a novel to add a new character
	{/if}

	{#await managerState.characters then characters}
		<ul>
			{#each characters as character}
				<li>{character.name}: {character.note}</li>
			{/each}
		</ul>
	{/await}
{/if}
