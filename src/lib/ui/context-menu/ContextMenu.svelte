<script lang="ts">
	import {run} from "svelte/legacy"

	import {createEventDispatcher} from "svelte"

	type Props = {
		children?: import("svelte").Snippet;
	}

	let {children}: Props = $props()

	const dispatch = createEventDispatcher()

	let contextMenuElement = $state(null)

	let posX               = $state(),
	    posY               = $state(),
	    contextMenuVisible = $state(false)

	export function openContextMenu(pX, pY) {
		posX               = pX
		posY               = pY
		contextMenuVisible = true

		registerBodyOnClickEvent()
	}

	export function closeContextMenu(ev) {
		contextMenuVisible = false

		dispatch("closed", ev)
	}

	// whenever x and y is changed, restrict box to be within bounds
	run(() => {
		(() => {
			if (!contextMenuElement) {
				return
			}

			const rect = contextMenuElement.getBoundingClientRect()
			posX       = Math.min(window.innerWidth - rect.width, posX)
			if (posY > window.innerHeight - rect.height) {
				posY -= rect.height
			}
		})(posX, posY)
	})

	let contextMenuStyle = $derived(`
		display: ${(contextMenuVisible && "block") || "none"};
		top: ${posY}px;
		left: ${posX}px;
	`)

	function onBodyClick(ev) {
		if (!contextMenuVisible) {
			return
		}

		closeContextMenu(ev)
	}

	function registerBodyOnClickEvent() {
		document.body.addEventListener("click", onBodyClick, {once: true})
	}
</script>

<div bind:this={contextMenuElement} class="context-menu" style={contextMenuStyle}>
	{@render children?.()}
</div>

<style lang="sass">
	.context-menu
		font-size: 1.1rem
		position: fixed
		background-color: white
		border-radius: .33rem
		overflow: hidden
		box-shadow: .3rem .3rem .3rem #ebebeb
		border-top: 3px solid #d45f5c
</style>
