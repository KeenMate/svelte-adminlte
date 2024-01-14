<script>
	import {createEventDispatcher} from "svelte"
	import {_} from "svelte-i18n"
	import Modal from "$lib/structure/modals/Modal.svelte"
	import ModalCloseButton from "$lib/ui/ModalCloseButton.svelte"
	import LteButton from "$lib/ui/buttons/LteButton.svelte"

	const dispatch = createEventDispatcher()

	export function showModal(dd) {
		deleteData = dd
		show()

		return new Promise((resolve, reject) => {
			resolveModal = resolve
			rejectModal = reject
		})
	}

	export function hideModal() {
		hide()
	}

	let jModalElement
	let show, hide
	let deleteData

	let resolveModal, rejectModal

	$: jModalElement && jModalElement.off("hidden.bs.modal", onModalHidden)
	$: jModalElement && jModalElement.on("hidden.bs.modal", onModalHidden)

	function onModalHidden() {
		dispatch("hidden")
		
		doReject()
	}
	
	function doReject() {
		rejectModal && rejectModal()
	}

	function doConfirm() {
		resolveModal(deleteData)
		dispatch("delete", deleteData)
	}
</script>

<Modal bind:jModalElement bind:show bind:hide {...$$restProps}>
	<svelte:fragment slot="header">
		{$_("common.labels.deleteConfirmation")}
	</svelte:fragment>

	<slot data={deleteData}></slot>

	<svelte:fragment slot="actions">
		<ModalCloseButton>
			{$_("common.buttons.close")}
		</ModalCloseButton>

		<LteButton
			color="danger"
			small
			on:click={doConfirm}
		>
			<i class="fas fa-trash fa-fw"></i> {$_("common.buttons.delete")}
		</LteButton>
	</svelte:fragment>
</Modal>
