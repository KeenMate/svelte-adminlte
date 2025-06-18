<script lang="ts">
	import {_} from "svelte-i18n"
	import Modal from "$lib/structure/modals/Modal.svelte"
	import ModalCloseButton from "$lib/ui/ModalCloseButton.svelte"

	export function showModal() {
		show()
	}

	let show = $state(), hide = $state()
</script>

<Modal
	bind:show
	bind:hide
	color="danger"
	center
>
	{#snippet header()}

		{$_("common.headers.connectionClosed")}

	{/snippet}

	<p>
		{@html $_("common.messages.connectionClosed")}
	</p>

	{#snippet actions()}

		<ModalCloseButton>
			{$_("common.buttons.close")}
		</ModalCloseButton>

	{/snippet}
</Modal>
