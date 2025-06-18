<!-- @migration-task Error while migrating Svelte code: Unexpected token
https://svelte.dev/e/js_parse_error -->
https://svelte.dev/e/js_parse_error -->
<script lang="ts">
	import {run} from "svelte/legacy"

	import {onDestroy, onMount, tick} from "svelte"
	import jQuery from "jquery"
	import ModalCloseButton from "$lib/ui/ModalCloseButton.svelte"
	import Loader from "$lib/ui/Loader.svelte"
	import {createEventDispatcher} from "svelte"

	const dispatch = createEventDispatcher()


	type Props = {
		jModalElement?: any;
		color?: string | null | undefined
		escapeClose?: boolean;
		clickClose?: boolean;
		showClose?: boolean;
		closeExisting?: boolean;
		small?: boolean;
		large?: boolean;
		xlarge?: boolean;
		center?: boolean;
		loading?: boolean;
		header?: import("svelte").Snippet;
		children?: import("svelte").Snippet;
		actions?: import("svelte").Snippet;
		loadingIcon?: import("svelte").Snippet;
	}

	let {
		    jModalElement = $bindable(undefined),
		    color         = null,
		    escapeClose   = true,
		    clickClose    = true,
		    showClose     = true,
		    closeExisting = false,
		    small         = false,
		    large         = false,
		    xlarge        = false,
		    center        = false,
		    loading       = false,
		    header,
		    children,
		    actions,
		    loadingIcon
	    }: Props = $props()

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
	let modalElement           = $state(null)
	let opened                 = false
	let documentHadOpenedModal = false


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
		jModalElement.on("shown.bs.modal", onModalShown)
		jModalElement.on("show.bs.modal", onModalShow)
	}

	async function onModalHidden() {
		dispatch("hidden")

		await tick()
		afterCloseModal()
	}

	function onModalShow() {
		beforeOpenModal()
	}

	function onModalShown() {
		dispatch("shown")
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

	run(() => {
		modalElement && initModal()
	})
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
					{@render header?.()}
				</h4>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">×</span>
				</button>
			</div>
			<div class="modal-body">
				{@render children?.()}
			</div>
			<div class="modal-footer">
				{#if actions}{@render actions()}{:else}
					<ModalCloseButton />
				{/if}
			</div>
			{#if loading}
				<div class="overlay">
					{#if loadingIcon}{@render loadingIcon()}{:else}
						<Loader />
					{/if}
				</div>
			{/if}
		</div>
		<!-- /.modal-content -->
	</div>
	<!-- /.modal-dialog -->
</div>
