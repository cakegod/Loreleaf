<script lang="ts">
	import CharactersList from "./components/characters-list.svelte";
	import NewCharacterForm from "./components/new-character-form.svelte";
	import NewNovelForm from "./components/new-novel-form.svelte";
	import { NovelsManager } from "./novels-manager.svelte";
	import { fade } from "svelte/transition";
	import { onMount } from "svelte";

	const manager = new NovelsManager();

	// for type narrowing
	let managerState = $derived(manager.state);

	onMount(() => {
		manager.init();
	});
</script>

<p>Create novel</p>
<NewNovelForm onAddNovel={manager.addNovel} />
<hr />

{#if managerState.status === "ready"}
	<div transition:fade class="current-novel-container">
		<label for="current-novel">Current novel:</label>
		<select
			id="current-novel"
			value={managerState.selectedNovelId}
			onchange={(e) => {
				manager.setSelectedNovel((e.target as HTMLSelectElement).value);
			}}
		>
			<option value="" disabled hidden>Select a novel</option>
			{#each managerState.novels as novel}
				<option
					selected={novel.id === managerState.selectedNovelId}
					value={novel.id}
				>
					{novel.title}
				</option>
			{/each}
		</select>
		{#if managerState.selectedNovelId}
			<button
				onclick={() => {
					confirm(
						"Are you sure you want to remove this novel and all its characters?",
					);
					manager.removeNovel(managerState.selectedNovelId);
				}}
			>
				Remove Novel
			</button>
		{/if}
	</div>

	{#if managerState.selectedNovelId}
		<hr />
		<NewCharacterForm onAddCharacter={manager.addCharacter} />
	{:else if managerState.novels.length === 0}
		Create a novel to add a new character
	{:else}
		Select a novel to add a new character
	{/if}

	<CharactersList
		characters={managerState.selectedNovelCharacters}
		onRemoveCharacter={manager.removeCharacter}
		onUpdateCharacter={manager.updateCharacter}
	/>
{/if}
