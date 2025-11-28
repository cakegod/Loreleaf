<script lang="ts">
	import type { NovelsManager } from "../novels-manager.svelte";

	interface Props {
		onAddCharacter: typeof NovelsManager.prototype.addCharacter;
	}

	let { onAddCharacter }: Props = $props();

	let newCharacter = $state<Omit<Character, "id" | "novelId">>({
		name: "",
		note: "",
	});
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		onAddCharacter(newCharacter);
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
