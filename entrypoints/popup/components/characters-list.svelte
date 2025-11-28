<script lang="ts">
	import type { Character } from "@/utils/stores";
	import type { NovelsManager } from "../novels-manager.svelte";
	import { slide } from "svelte/transition";

	interface Props {
		characters: Character[];
		onRemoveCharacter: typeof NovelsManager.prototype.removeCharacter;
		onUpdateCharacter: typeof NovelsManager.prototype.updateCharacter;
	}

	let { characters, onRemoveCharacter, onUpdateCharacter }: Props = $props();

	let editingId: null | Character["id"] = $state(null);
	let draftCharacter = $state({ name: "", note: "" });
</script>

<ul class="characters_list">
	{#each characters as character}
		<li transition:slide>
			{#if editingId === character.id}
				<p>Editing</p>
				<form
					onsubmit={(e) => {
						e.preventDefault();
						onUpdateCharacter(character.id, draftCharacter);
						editingId = null;
					}}
				>
					<div class="input__group">
						<label for="character-name">Character name</label>
						<input
							name="character-name"
							id="character-name"
							bind:value={draftCharacter.name}
						/>
					</div>

					<div class="input__group">
						<label for="character-note">Character note</label>
						<input
							name="character-note"
							id="character-note"
							bind:value={draftCharacter.note}
						/>
					</div>
					<button>Save edit</button>
					<button type="button" onclick={() => (editingId = null)}>
						Cancel edit
					</button>
				</form>
			{:else}
				<div class="characters_list__item">
					<button
						onclick={() => {
							editingId = character.id;
							draftCharacter = { ...character };
						}}
					>
						{character.name}: {character.note}
					</button>
					<button
						onclick={() => {
							onRemoveCharacter(character.id);
						}}
					>
						Delete
					</button>
				</div>
			{/if}
		</li>
	{/each}
</ul>
