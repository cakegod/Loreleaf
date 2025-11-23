<script lang="ts">
	import { NovelsManager } from "./novels-manager.svelte";
	import { onMount } from "svelte";

	const manager = new NovelsManager();

	let newNovelTitle = $state("");
	let newCharacter = $state({
		name: "",
		note: "",
	});

	onMount(() => {
		manager.init();
	});

	$inspect(manager.state);
</script>

<p>Create novel</p>
<input
	type="text"
	name="new-novel-title"
	id="new-novel-title"
	bind:value={newNovelTitle}
/>
<button
	onclick={async () => {
		manager.addNovel(newNovelTitle);
		newNovelTitle = "";
	}}
>
	Add novel
</button>

{#if manager.state.status === "loading"}
	Loading...
{:else if manager.state.status === "idle"}
	<label for="current-novel">Current novel:</label>
	<select
		id="current-novel"
		value={manager.state.currentNovelId}
		onchange={(e) => {
			manager.setCurrentNovel((e.target as HTMLOptionElement).value);
		}}
	>
		{#each manager.state.novels as novel}
			<option
				selected={novel.id === manager.state.currentNovelId}
				value={novel.id}
			>
				{novel.title}
			</option>
		{/each}
	</select>

	{#if manager.state.currentNovelId}
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
	{:else}
		Add a novel to add characters
	{/if}

	{#await manager.state.characters then characters}
		<ul>
			{#each characters as character}
				<li>{character.name}: {character.note}</li>
			{/each}
		</ul>
	{/await}
{/if}
