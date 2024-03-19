<script
	context="module"
	lang="ts"
>
	export const CardLoadingContext = Symbol()

	export type contextType = {
		setLoading(setTo: boolean): void
	}
</script>

<script>
	import {setContext} from "svelte"
	import Loader from "../ui/Loader.svelte"

	export let color = "default"

	export let outline = false
	export let tabs = false
	export let outlineTabs = false
	export let noPadding = false
	export let loading = false
	export let sharedLoading = false
	export let title = ""
	export let icon = ""

	if (sharedLoading)
		setContext(CardLoadingContext, {
			setLoading(loading_) {
				loading = loading_
			}
		})
</script>

<div
	class="card {(color && 'card-' + color) || ''} {$$props.class || ''}"
	class:card-outline={outline}
	class:card-outline-tabs={outlineTabs}
	class:card-tabs={tabs}
>
	{#if $$slots.header || $$slots.tools || $$slots.fullHeader || title !== "" || icon !== ""}
		<div class="card-header {$$props.headerClass || ''}">
			{#if $$slots.fullHeader}
				<slot name="fullHeader" />
			{:else}
				<h3 class="card-title">
					{#if icon !== "" && !$$slots.header}
						<i class={icon} />
					{/if}
					{#if title !== "" && !$$slots.header}
						{title}
					{:else}
						<slot name="header" />
					{/if}
				</h3>

				<div class="card-tools pull-right">
					<slot name="tools" />
				</div>
			{/if}
		</div>
	{/if}
	<div
		class="card-body {$$restProps.bodyClass || ''}"
		class:p-0={noPadding}
	>
		<slot />
	</div>
	{#if $$slots.footer}
		<div class="card-footer">
			<slot name="footer" />
		</div>
	{/if}
	{#if loading}
		<div class="overlay">
			<Loader />
		</div>
	{/if}
</div>
