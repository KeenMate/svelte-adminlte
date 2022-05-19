<script>
	import {Callout} from "../../index"

	export let listElement
	export let items
	export let idProp = "id"
	export let color = "info"
</script>

<div bind:this={listElement} id="draggable-list">
	{#each items as item}
		<div data-id={item[idProp]} class="draggable-callout">
			<Callout color={color}>
				<div class="d-inline-flex">
					<div class="draggable-handle text-muted mr-3 align-self-center">
						<i class="fas fa-grip-vertical"></i>
					</div>

					<div class="col-12">
						<slot item={item}></slot>
					</div>
				</div>
			</Callout>
		</div>
	{/each}
</div>
