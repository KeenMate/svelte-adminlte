<script
	module
	lang="ts"
>
	export const CardLoadingContext = Symbol()

	export type contextType = {
		setLoading(setTo: boolean): void
	}
</script>

<script lang="ts">
	import {setContext} from "svelte"
	import Loader from "../ui/Loader.svelte"
	import CardTitle from "$lib/structure/CardTitle.svelte"


	type Props = {
		color?: string;
		outline?: boolean;
		tabs?: boolean;
		outlineTabs?: boolean;
		noPadding?: boolean;
		loading?: boolean;
		sharedLoading?: boolean;
		title?: string;
		icon?: string;
		headerBackgroundColor?: string;
		titleColor?: string;
		header?: import("svelte").Snippet;
		tools?: import("svelte").Snippet;
		fullHeader?: import("svelte").Snippet;
		children?: import("svelte").Snippet;
		footer?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    color                 = "default",
		    outline               = false,
		    tabs                  = false,
		    outlineTabs           = false,
		    noPadding             = false,
		    loading               = $bindable(false),
		    sharedLoading         = false,
		    title                 = "",
		    icon                  = "",
		    headerBackgroundColor = "white",
		    titleColor            = "black",
		    header,
		    tools,
		    fullHeader,
		    children,
		    footer,
		    ...restProps
	    }: Props = $props()

	if (sharedLoading) {
		setContext(CardLoadingContext, {
			setLoading(loading_) {
				loading = loading_
			}
		})
	}
</script>

<div
	class="card {(color && 'card-' + color) || ''} {restProps.class || ''}"
	class:card-outline={outline}
	class:card-outline-tabs={outlineTabs}
	class:card-tabs={tabs}
>
	{#if header || tools || fullHeader || title !== "" || icon !== ""}
		<div
			class="card-header {restProps.headerClass || ''}"
			style="background-color:{headerBackgroundColor};"
		>
			{#if fullHeader}
				{@render fullHeader?.()}
			{:else}
				<CardTitle color={titleColor}>
					{#if icon !== "" && !header}
						<i class={icon}></i>
					{/if}
					{#if title !== "" && !header}
						{title}
					{:else}
						{@render header?.()}
					{/if}
				</CardTitle>

				<div class="card-tools pull-right">
					{@render tools?.()}
				</div>
			{/if}
		</div>
	{/if}
	<div
		class="card-body {restProps.bodyClass || ''}"
		class:p-0={noPadding}
	>
		{@render children?.()}
	</div>
	{#if footer}
		<div class="card-footer">
			{@render footer?.()}
		</div>
	{/if}
	{#if loading}
		<div class="overlay">
			<Loader />
		</div>
	{/if}
</div>
