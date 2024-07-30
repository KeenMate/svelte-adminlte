<script lang="ts">
	import Callout from "./Callout.svelte"

	export let listElement
	export let items
	export let idProp = "id"
	export let color = "info"
</script>

<div bind:this={listElement} id="draggable-list">
	{#each items as item}
		<div data-id={item[idProp]} class="draggable-callout">
			<Callout {color}>
				<div class="d-inline-flex">
					<div class="draggable-handle text-muted mr-3 align-self-center">
						<i class="fas fa-grip-vertical" />
					</div>

					<div class="col-12">
						<slot {item} />
					</div>
				</div>
			</Callout>
		</div>
	{/each}
</div>
