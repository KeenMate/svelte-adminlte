<script>
	import {createEventDispatcher} from "svelte"

	const dispatch = createEventDispatcher()

	let contextMenuElement = null

	let posX,
		posY,
		contextMenuVisible = false

	export function openContextMenu(pX, pY) {
		posX = pX
		posY = pY
		contextMenuVisible = true

		registerBodyOnClickEvent()
	}

	export function closeContextMenu(ev) {
		contextMenuVisible = false

		dispatch("closed", ev)
	}

	// whenever x and y is changed, restrict box to be within bounds
	$: (() => {
		if (!contextMenuElement) return

		const rect = contextMenuElement.getBoundingClientRect()
		posX = Math.min(window.innerWidth - rect.width, posX)
		if (posY > window.innerHeight - rect.height) posY -= rect.height
	})(posX, posY)

	$: contextMenuStyle = `
		display: ${(contextMenuVisible && "block") || "none"};
		top: ${posY}px;
		left: ${posX}px;
	`

	function onBodyClick(ev) {
		if (!contextMenuVisible) return

		closeContextMenu(ev)
	}

	function registerBodyOnClickEvent() {
		document.body.addEventListener("click", onBodyClick, {once: true})
	}
</script>

<div bind:this={contextMenuElement} class="context-menu" style={contextMenuStyle}>
	<slot />
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
