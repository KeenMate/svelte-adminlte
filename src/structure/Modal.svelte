<script>
	import {onDestroy, onMount} from "svelte"
	import jQuery from "jquery"
	import ModalCloseButton from "../ui/ModalCloseButton.svelte"

	export let small = false
	export let large = false
	export let xlarge = false
	export let center = false
	export let jModalElement

	let modalElement = null
	let opened = false

	$: jModalElement = modalElement && jQuery(modalElement)

	onMount(() => {
		document.addEventListener("keydown", onDocumentKeyDown)
	})

	onDestroy(() => {
		document.removeEventListener("keydown", onDocumentKeyDown)
	})

	export function toggle() {
		jQuery(modalElement).modal("toggle")
		opened = !opened
	}

	export function show() {
		jQuery(modalElement).modal("show")
		opened = true
	}

	export function hide() {
		jQuery(modalElement).modal("hide")
		opened = false
	}

	function onDocumentKeyDown(ev) {
		if (!opened || ev.key !== "Escape")
			return

		hide()
	}
</script>

<div bind:this={modalElement} class="modal fade in">
	<div
		class="modal-dialog"
		class:modal-dialog-centered={center}
		class:modal-sm={small}
		class:modal-lg={large}
		class:modal-xl={xlarge}
	>
		<div class="modal-content">
			<div class="modal-header">
				<h4 class="modal-title">
					<slot name="header" />
				</h4>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">×</span>
				</button>
			</div>
			<div class="modal-body">
				<slot />
			</div>
			<div class="modal-footer">
				<slot name="actions">
					<ModalCloseButton />
				</slot>
			</div>
		</div>
		<!-- /.modal-content -->
	</div>
	<!-- /.modal-dialog -->
</div>
