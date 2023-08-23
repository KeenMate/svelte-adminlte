<script>
	import {Modal, ModalCloseButton} from "@keenmate/svelte-adminlte"
	import {_} from "svelte-i18n"

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
