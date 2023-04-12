<script>
	// this is working in bundle
	import {getContext} from "svelte"
	import lazyLoader from "js-common-helpers/src/helpers/lazy-loader"
	import {emptyPromise} from "js-common-helpers/src/helpers/promise"
	import {CardLoadingContext} from "./Card.svelte"
	import {getConfig} from "$lib/config"
	import Loader from "$lib/ui/Loader.svelte"

	const context = getContext(CardLoadingContext)

	const {lazyLoader: config} = getConfig()
	/**
  @type {Promise<unknown>}
  */
	export let task
	export let loading = false
	export let parentLoading = false

	/**
  @type {unknown}
  */
	let oldData

	$: lazyTask = (task && lazyLoader(task, showLoader, hideLoader, config)) || emptyPromise
	$: lazyTask?.then(x => {
		oldData = x
	})

	function showLoader() {
		setLoading(true)
	}

	function hideLoader() {
		setLoading(false)
	}

	/**
	 *
	 * @param loading_ {boolean}
	 */
	function setLoading(loading_) {
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
