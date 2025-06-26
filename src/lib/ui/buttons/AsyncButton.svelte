<script lang="ts">
	import LteButton from "./LteButton.svelte"

	type Props = {
		action?: (() => Promise<any>) | null;
		enabledWhenLoading?: boolean;
		iconClass?: string | null;
		disabled?: boolean;
		loading?: boolean;
		onClick?: (ev: MouseEvent) => void
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    action             = null,
		    enabledWhenLoading = false,
		    iconClass          = null,
		    disabled           = false,
		    loading            = $bindable(false),
		    onClick = undefined,
		    children = undefined,
		    ...restProps
	    }: Props = $props()

	let computedDisabled = $derived(disabled || (enabledWhenLoading ? false : loading))

	async function onClickInternal(ev: MouseEvent) {
		if (!action) {
			onClick?.(ev)
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
	onClick={onClickInternal}
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
