<script lang="ts">
	import {run} from "svelte/legacy"

	import {createEventDispatcher} from "svelte"
	import {_} from "svelte-i18n"
	import Modal from "$lib/structure/modals/Modal.svelte"
	import ModalCloseButton from "$lib/ui/ModalCloseButton.svelte"
	import LteButton from "$lib/ui/buttons/LteButton.svelte"

	type Props = {
		children?: import("svelte").Snippet<[any]>;

		[key: string]: any
	}

	let {children, ...restProps}: Props = $props()

	const dispatch = createEventDispatcher()

	export function showModal(dd) {
		deleteData = dd
		show()

		return new Promise((resolve, reject) => {
			resolveModal = resolve
			rejectModal  = reject
		})
	}

	export function hideModal() {
		hide()
	}

	let jModalElement = $state()
	let show          = $state(), hide = $state()
	let deleteData    = $state()

	let resolveModal, rejectModal


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

	run(() => {
		jModalElement && jModalElement.off("hidden.bs.modal", onModalHidden)
	})
	run(() => {
		jModalElement && jModalElement.on("hidden.bs.modal", onModalHidden)
	})
</script>

<Modal bind:jModalElement bind:show bind:hide {...restProps}>
	{#snippet header()}

		{$_("common.labels.deleteConfirmation")}

	{/snippet}

	{@render children?.({data: deleteData,})}

	{#snippet actions()}

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

	{/snippet}
</Modal>
