<script lang="ts">
	// this is working in bundle
	import {getContext} from "svelte"
	import lazyLoader from "@keenmate/js-common-helpers/helpers/lazy-loader"
	import {emptyPromise} from "@keenmate/js-common-helpers/helpers/promise"
	import {CardLoadingContext, type contextType} from "./Card.svelte"
	import {Config} from "$lib/config.js"
	import Loader from "$lib/ui/Loader.svelte"

	type TData = $$Generic

	interface $$Slots {
		// If you want to type the default slot, change the property name below to "default"
		default: { data: TData }
		catch: {}
		loader: {}
	}

	const context: contextType = getContext(CardLoadingContext)

	export let task: Promise<TData>
	export let loading = false
	export let parentLoading = false

	let oldData: TData

	let lazyTask: Promise<TData>

	$: lazyTask =
		(task && lazyLoader<TData>(task, showLoader, hideLoader, $Config.lazyLoader)) ||
		(emptyPromise as Promise<TData>)
	$: lazyTask?.then(x => {
		oldData = x as TData
	})

	function showLoader() {
		setLoading(true)
	}

	function hideLoader() {
		setLoading(false)
	}

	function setLoading(loading_: boolean) {
		loading = loading_
		context?.setLoading(loading_)
	}
</script>

{#await lazyTask}
	{#if loading && !parentLoading}
		<slot name="loader">
			<Loader />
		</slot>
	{:else}
		<slot data={oldData} />
	{/if}
{:then data}
	<slot {data} />
{:catch error}
	<slot name="catch" {error} />
{/await}
