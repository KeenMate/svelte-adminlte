<script>
	import {createEventDispatcher} from "svelte"
	import {LteButton, Modal, ModalCloseButton} from "@keenmate/svelte-adminlte"
	import {_} from "svelte-i18n"

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

	$: jModalElement && jModalElement.off("hidden.bs.modal", doReject)
	$: jModalElement && jModalElement.on("hidden.bs.modal", doReject)

	function doReject() {
		rejectModal && rejectModal()
	}

	function doConfirm() {
		resolveModal(deleteData)
		dispatch("delete", deleteData)
	}
</script>

<Modal bind:jModalElement bind:show bind:hide>
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
