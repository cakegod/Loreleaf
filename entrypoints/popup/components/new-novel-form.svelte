<script lang="ts">
	import type { NovelsManager } from "../novels-manager.svelte";

	let newNovel = $state<Omit<Novel, "id">>({ title: "", description: "" });

	interface Props {
		onAddNovel: typeof NovelsManager.prototype.addNovel;
	}

	let { onAddNovel }: Props = $props();
</script>

<form
	onsubmit={async (e) => {
		e.preventDefault();
		await onAddNovel(newNovel);
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
