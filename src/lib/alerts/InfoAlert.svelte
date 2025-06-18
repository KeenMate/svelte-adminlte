<script lang="ts">
	import BaseAlert from "./BaseAlert.svelte"
	import {Config} from "$lib/config.js"

	type Props = {
		headerText?: string | undefined;
		icon?: string | undefined;
		level?: string | undefined;
		closeable?: boolean | undefined;
		header?: import("svelte").Snippet;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    headerText = undefined,
		    icon       = undefined,
		    level      = undefined,
		    closeable  = undefined,
		    header,
		    children,
		    ...restProps
	    }: Props = $props()

	let alertBaseDefaults    = $derived($Config.defaults?.alerts?.base || {})
	let specialAlertDefaults = $derived($Config.defaults?.alerts?.info || {})
	let iconClass            = $derived(icon || specialAlertDefaults.iconClass || alertBaseDefaults.iconClass)
	let computedLevel        = $derived(level || specialAlertDefaults.level || alertBaseDefaults.level)

	const header_render = $derived(header)
</script>

<BaseAlert
	{...restProps}
	{headerText}
	icon={iconClass}
	level={computedLevel}
	{closeable}
	on:closed
>
	{#snippet header()}
		{@render header_render?.()}
	{/snippet}
	{@render children?.()}
</BaseAlert>
