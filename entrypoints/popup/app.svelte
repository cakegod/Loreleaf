<script lang="ts">
	import { fade, slide } from "svelte/transition";
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
<form
	onsubmit={async (e) => {
		e.preventDefault();
		await manager.addNovel(newNovel);
		newNovel.title = "";
	}}
>
	<div class="input__group">
		<label for="new-novel-title">
			Novel title
			<span aria-hidden="true" class="label__required">(required)</span>
		</label>
		<input
			required
			type="text"
			name="new-novel-title"
			id="new-novel-title"
			bind:value={newNovel.title}
		/>
	</div>
	<div class="input__group">
		<label for="new-novel-description">Novel description</label>
		<textarea
			name="new-novel-description"
			id="new-novel-description"
			bind:value={newNovel.description}
		>
		</textarea>
	</div>
	<button>Add novel</button>
</form>
<hr />

{#if managerState.status === "idle"}
	<div transition:fade class="current-novel-container">
		<div class="input__group">
			<label for="current-novel">Current novel:</label>
			<select
				id="current-novel"
				value={managerState.currentNovelId}
				onchange={(e) => {
					manager.setCurrentNovel((e.target as HTMLOptionElement).value);
				}}
			>
				<option value="" disabled hidden>Select a novel</option>
				{#each managerState.novels as novel}
					<option
						selected={novel.id === managerState.currentNovelId}
						value={novel.id}
					>
						{novel.title}
					</option>
				{/each}
			</select>
		</div>
		{#if managerState.currentNovelId}
			<button
				onclick={() => {
					confirm(
						"Are you sure you want to remove this novel and all its characters?",
					);
					manager.removeNovel(managerState.currentNovelId);
				}}
			>
				Remove Novel
			</button>
		{/if}
	</div>
	{#if managerState.currentNovelId}
		<hr />
		<form
			onsubmit={(e) => {
				e.preventDefault();
				manager.addCharacter(newCharacter);
				newCharacter = {
					name: "",
					note: "",
				};
			}}
		>
			<div class="input__group">
				<label for="new-character-name">
					Character name
					<span aria-hidden="true" class="label__required"> (required) </span>
				</label>
				<input
					required
					type="text"
					name="new-character-name"
					id="new-character-name"
					bind:value={newCharacter.name}
				/>
			</div>
			<div class="input__group">
				<label for="new-character-note">
					Character note
					<span aria-hidden="true" class="label__required"> (required) </span>
				</label>
				<textarea
					required
					name="new-character-note"
					id="new-character-note"
					bind:value={newCharacter.note}
				>
				</textarea>
			</div>
			<button>Add character</button>
		</form>
	{:else if managerState.novels.length === 0}
		Create a novel to add a new character
	{:else}
		Select a novel to add a new character
	{/if}

	<ul class="characters_list">
		{#each managerState.characters as character}
			<li transition:slide>
				<div class="characters_list__item">
					<p>
						{character.name}: {character.note}
					</p>
					<button
						onclick={() => {
							manager.removeCharacter(character.id);
						}}
					>
						Delete
					</button>
				</div>
			</li>
		{/each}
	</ul>
{/if}
