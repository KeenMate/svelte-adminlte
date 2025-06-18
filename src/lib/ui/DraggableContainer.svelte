<script lang="ts">
	import Callout from "./Callout.svelte"

	type Props = {
		listElement: any;
		items: any;
		idProp?: string;
		color?: string;
		children?: import("svelte").Snippet<[any]>;
	}

	let {
		    listElement = $bindable(),
		    items,
		    idProp      = "id",
		    color       = "info",
		    children
	    }: Props = $props()
</script>

<div bind:this={listElement} id="draggable-list">
	{#each items as item}
		<div data-id={item[idProp]} class="draggable-callout">
			<Callout {color}>
				<div class="d-inline-flex">
					<div class="draggable-handle text-muted mr-3 align-self-center">
						<i class="fas fa-grip-vertical"></i>
					</div>

					<div class="col-12">
						{@render children?.({item,})}
					</div>
				</div>
			</Callout>
		</div>
	{/each}
</div>
