<script>
	import {getContext} from "svelte"

	export let key
	export let id
	export let headerId

	const {currentEntry, id: parentId} = getContext(key)
</script>

<div class="card">
	<div class="card-header" id={headerId}>
		<h2 class="mb-0">
			<slot name="header">
				<button
					class="btn btn-link btn-block text-left"
					type="button"
					data-toggle="collapse"
					data-target="#{id}"
					aria-expanded="true"
					aria-controls={id}
					on:click={() => ($currentEntry = id)}
				>
					<slot name="headerText" />
				</button>
			</slot>
		</h2>
	</div>

	<div
		{id}
		class="collapse"
		class:show={$currentEntry === id}
		aria-labelledby={headerId}
		data-parent="#{parentId}"
	>
		<div class="card-body">
			<slot />
		</div>
	</div>
</div>
