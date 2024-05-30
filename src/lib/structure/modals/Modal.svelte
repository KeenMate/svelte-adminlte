<script lang="ts">
	import {onDestroy, onMount, tick} from "svelte"
	import jQuery from "jquery"
	import ModalCloseButton from "$lib/ui/ModalCloseButton.svelte"
	import Loader from "$lib/ui/Loader.svelte"

	/**
	 * @type {any?}
	 */

	export let jModalElement = undefined
	/**
	 * @type {string?}
	 */
	export let color         = null
	export let escapeClose   = true
	export let clickClose    = true
	export let showClose     = true
	export let closeExisting = false
	export let small         = false
	export let large         = false
	export let xlarge        = false
	export let center        = false
	export let loading       = false

	export function toggle() {
		if (!opened) {
			beforeOpenModal()
		}

		jQuery(modalElement).modal("toggle")
		opened = !opened

		if (!opened) {
			afterCloseModal()
		}
	}

	export function show() {
		// beforeOpenModal()

		jQuery(modalElement).modal("show")
		opened = true
	}

	export function hide() {
		jQuery(modalElement).modal("hide")
		opened = false

		// afterCloseModal()
	}

	/**
	 * @type {HTMLDivElement?}
	 */
	let modalElement           = null
	let opened                 = false
	let documentHadOpenedModal = false

	$: modalElement && initModal()

	onMount(() => {
		document.addEventListener("keydown", onDocumentKeyDown)
	})

	onDestroy(() => {
		document.removeEventListener("keydown", onDocumentKeyDown)

		clearModalEventHandlers()
	})

	function clearModalEventHandlers() {
		if (!jModalElement) {
			return
		}

		jModalElement.off("hidden.bs.modal", onModalHidden)
		jModalElement.off("show.bs.modal", onModalShow)
	}

	function beforeOpenModal() {
		documentHadOpenedModal = document.body.classList.contains("modal-open")
	}

	async function afterCloseModal() {
		await tick()

		if (documentHadOpenedModal) {
			document.body.classList.add("modal-open")
		}
	}

	function initModal() {
		jModalElement = jQuery(modalElement).modal({
			keyboard: escapeClose,
			backdrop: clickClose ? true : "static",
			showClose,
			closeExisting,
			show:     false
		})

		jModalElement.on("hidden.bs.modal", onModalHidden)
		jModalElement.on("show.bs.modal", onModalShow)
	}

	async function onModalHidden() {
		await tick()
		afterCloseModal()
	}

	function onModalShow() {
		beforeOpenModal()
	}

	/**
	 * @param {{ key: string; }} ev
	 */
	function onDocumentKeyDown(ev) {
		if (!opened || ev.key !== "Escape") {
			return
		}

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
		<div class="modal-content {(color && `bg-${color}`) || ''}">
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
			{#if loading}
				<div class="overlay">
					<slot name="loading-icon">
						<Loader />
					</slot>
				</div>
			{/if}
		</div>
		<!-- /.modal-content -->
	</div>
	<!-- /.modal-dialog -->
</div>
