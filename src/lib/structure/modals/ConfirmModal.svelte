<script>
	import {createEventDispatcher, tick} from "svelte"
	import {_} from "svelte-i18n"
	import Modal from "./Modal.svelte"
	import ModalCloseButton from "$lib/ui/ModalCloseButton.svelte"
	import LteButton from "$lib/ui/buttons/LteButton.svelte"

	const dispatch = createEventDispatcher()

	export async function showModal(m, h) {
		message = m
		header = h
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
	let show, hide
	let message, header

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
		{header || ""}
	</svelte:fragment>

	<p>
		{message || ""}
	</p>

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
