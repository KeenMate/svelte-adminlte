<script lang="ts">
	import {_} from "svelte-i18n"
	import Modal from "$lib/structure/modals/Modal.svelte"
	import ModalCloseButton from "$lib/ui/ModalCloseButton.svelte"

	export function showModal() {
		show()
	}

	let show, hide
</script>

<Modal
	bind:show
	bind:hide
	color="danger"
	center
>
	<svelte:fragment slot="header">
		{$_("common.headers.connectionClosed")}
	</svelte:fragment>

	<p>
		{@html $_("common.messages.connectionClosed")}
	</p>

	<svelte:fragment slot="actions">
		<ModalCloseButton>
			{$_("common.buttons.close")}
		</ModalCloseButton>
	</svelte:fragment>
</Modal>
