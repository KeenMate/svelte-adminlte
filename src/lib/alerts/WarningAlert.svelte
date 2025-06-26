<script lang="ts">
	import BaseAlert from "./BaseAlert.svelte"
	import {Config} from "$lib/config.js"

	type Props = {
		headerText?: string | undefined;
		icon?: string | undefined;
		level?: string | undefined;
		closeable?: boolean | undefined;
		onClosed?: VoidFunction
		header?: import("svelte").Snippet;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    icon       = undefined,
		    level      = undefined,
		    closeable  = undefined,
		    header,
		    children,
		    ...restProps
	    }: Props = $props()

	let alertBaseDefaults    = $derived($Config.defaults?.alerts?.base || {})
	let specialAlertDefaults = $derived($Config.defaults?.alerts?.warning || {})
	let iconClass            = $derived(icon || specialAlertDefaults.iconClass || alertBaseDefaults.iconClass)
	let computedLevel        = $derived(level || specialAlertDefaults.level || alertBaseDefaults.level)

	const header_render = $derived(header)
</script>

<BaseAlert
	{...restProps}
	icon={iconClass}
	level={computedLevel}
	{closeable}
>
	{#snippet header()}
		{@render header_render?.()}
	{/snippet}
	{@render children?.()}
</BaseAlert>
