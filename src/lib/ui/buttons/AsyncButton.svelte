<script lang="ts">
	import {createEventDispatcher} from "svelte"
	import LteButton from "./LteButton.svelte"

	const dispatch = createEventDispatcher()


	type Props = {
		action?: (() => Promise<any>) | null;
		enabledWhenLoading?: boolean;
		iconClass?: string | null;
		disabled?: boolean;
		loading?: boolean;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    action             = null,
		    enabledWhenLoading = false,
		    iconClass          = null,
		    disabled           = false,
		    loading            = $bindable(false),
		    children,
		    ...restProps
	    }: Props = $props()

	let computedDisabled = $derived(disabled || (enabledWhenLoading ? false : loading))

	async function onClick(ev: MouseEvent) {
		if (!action) {
			dispatch("click", ev)
			return
		}

		try {
			loading = true
			await action()
		} finally {
			loading = false
		}
	}
</script>

<LteButton
	{...restProps}
	disabled={computedDisabled}
	on:click={onClick}
>
	{#if loading}
		<i
			class="fas fa-circle-notch fa-spin fa-fw"
			style="--fa-animation-duration: 1s"
		></i>
	{:else if iconClass}
		<i class={iconClass}></i>
	{/if}

	{@render children?.()}
</LteButton>
