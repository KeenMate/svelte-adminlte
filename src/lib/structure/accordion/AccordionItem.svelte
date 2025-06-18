<script lang="ts">
	import {getContext} from "svelte"

	let {
		    key,
		    id,
		    headerId,
		    header,
		    headerText,
		    children
	    } = $props()

	const {currentEntry, id: parentId} = getContext(key)
</script>

<div class="card">
	<div class="card-header" id={headerId}>
		<h2 class="mb-0">
			{#if header}{@render header()}{:else}
				<button
					class="btn btn-link btn-block text-left"
					type="button"
					data-toggle="collapse"
					data-target="#{id}"
					aria-expanded="true"
					aria-controls={id}
					onclick={() => ($currentEntry = id)}
				>
					{@render headerText?.()}
				</button>
			{/if}
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
			{@render children?.()}
		</div>
	</div>
</div>
