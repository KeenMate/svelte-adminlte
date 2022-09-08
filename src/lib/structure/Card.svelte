<script context="module">
	export const CardLoadingContext = Symbol()
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
	
	if (sharedLoading)
		setContext(CardLoadingContext, {
			setLoading(loading_) {
				loading = loading_
			}
		})
</script>

<div
	class="card card-{color} {$$props.class || ''}"
	class:card-outline={outline}
	class:card-outline-tabs={outlineTabs}
	class:card-tabs={tabs}
>
	{#if $$slots.header || $$slots.tools || $$slots.fullHeader}
		<div class="card-header {$$props.headerClass || ''}">
			{#if $$slots.fullHeader}
				<slot name="fullHeader" />
			{:else}
				<h3 class="card-title">
					<slot name="header" />
				</h3>
				<div class="card-tools pull-right">
					<slot name="tools" />
				</div>
			{/if}
		</div>
	{/if}
	<div class="card-body" class:p-0={noPadding}>
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
