<script lang="ts">
	import {run} from "svelte/legacy"

	import {createEventDispatcher, tick} from "svelte"
	import {_} from "svelte-i18n"
	import Modal from "./Modal.svelte"
	import ModalCloseButton from "$lib/ui/ModalCloseButton.svelte"
	import LteButton from "$lib/ui/buttons/LteButton.svelte"

	const dispatch = createEventDispatcher()

	type Props = {
		htmlDisabled?: boolean;
		header?: import("svelte").Snippet<[any]>;
		children?: import("svelte").Snippet<[any]>;

		[key: string]: any
	}

	let {htmlDisabled = false, header, children, ...restProps}: Props = $props()

	export async function showModal(message_?: string | null, header_?: string | null, data_?: any) {
		message    = message_
		headerText = header_
		data       = data_
		await tick()

		show()

		return new Promise(resolve => {
			resolveModal = resolve
		})
	}

	export function hideModal() {
		hide()
	}

	let jModalElement                         = $state()
	let show: () => void                      = $state()
	let hide: () => void                      = $state()
	let message: string | null | undefined    = $state()
	let headerText: string | null | undefined = $state()
	let data: any                             = $state()

	let resolveModal


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

	run(() => {
		jModalElement && jModalElement.off("hidden.bs.modal", onModalHidden)
	})
	run(() => {
		jModalElement && jModalElement.on("hidden.bs.modal", onModalHidden)
	})

	const header_render = $derived(header)
</script>

<Modal bind:jModalElement bind:show bind:hide {...restProps}>
	{#snippet header()}

		{#if header_render}{@render header_render({data,})}{:else}
			{#if htmlDisabled}
				{headerText || ""}
			{:else}
				{@html headerText || ""}
			{/if}
		{/if}

	{/snippet}

	{#if children}{@render children({data,})}{:else}
		<p>
			{#if htmlDisabled}
				{message || ""}
			{:else}
				{@html message || ""}
			{/if}
		</p>
	{/if}

	{#snippet actions()}

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

	{/snippet}
</Modal>
