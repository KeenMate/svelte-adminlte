<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot making the component unusable -->
<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot making the component unusable -->
<script lang="ts">
	import {createEventDispatcher, tick} from "svelte"
	import {_} from "svelte-i18n"
	import Modal from "./Modal.svelte"
	import ModalCloseButton from "$lib/ui/ModalCloseButton.svelte"
	import LteButton from "$lib/ui/buttons/LteButton.svelte"

	const dispatch = createEventDispatcher()

	export let htmlDisabled = false

	export async function showModal(message_?: string | null, header_?: string | null, data_?: any) {
		message = message_
		header = header_
		data = data_
		await tick()

		show()

		return new Promise(resolve => {
			resolveModal = resolve
		})
	}

	export function hideModal() {
		hide()
	}

	let jModalElement
	let show: () => void
	let hide: () => void
	let message: string | null | undefined
	let header: string | null | undefined
	let data: any

	let resolveModal

	$: jModalElement && jModalElement.off("hidden.bs.modal", onModalHidden)
	$: jModalElement && jModalElement.on("hidden.bs.modal", onModalHidden)

	function onModalHidden() {
		dispatch("hidden")

		doReject()
	}

	function doReject() {
		resolveModal(false)
		hide()
	}

	function doConfirm() {
		resolveModal(true)
		hide()
	}
</script>

<Modal bind:jModalElement bind:show bind:hide {...$$restProps}>
	<svelte:fragment slot="header">
		<slot name="header" {data}>
			{#if htmlDisabled}
				{header || ""}
			{:else}
				{@html header || ""}
			{/if}
		</slot>
	</svelte:fragment>

	<slot {data}>
		<p>
			{#if htmlDisabled}
				{message || ""}
			{:else}
				{@html message || ""}
			{/if}
		</p>
	</slot>

	<svelte:fragment slot="actions">
		<ModalCloseButton>
			{$_("common.buttons.close")}
		</ModalCloseButton>

		<LteButton
			color="success"
			small
			on:click={doConfirm}
		>
			<i class="fas fa-check fa-fw"></i> {$_("common.buttons.confirm")}
		</LteButton>
	</svelte:fragment>
</Modal>
