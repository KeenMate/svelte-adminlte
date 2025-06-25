<script lang="ts" generics="TData">
	import {run} from "svelte/legacy"

	// this is working in bundle
	import {getContext} from "svelte"
	import lazyLoader from "@keenmate/js-common-helpers/helpers/lazy-loader.js"
	import {emptyPromise} from "@keenmate/js-common-helpers/helpers/promise.js"
	import {CardLoadingContext, type contextType} from "./Card.svelte"
	import {Config} from "$lib/config.js"
	import Loader from "$lib/ui/Loader.svelte"

	const context: contextType = getContext(CardLoadingContext)

	type Props = {
		task: Promise<TData>;
		loading?: boolean;
		parentLoading?: boolean;
		loader?: import("svelte").Snippet;
		children?: import("svelte").Snippet<[any]>;
		onError?: import("svelte").Snippet<[any]>;
	}

	let {
		    task,
		    loading       = $bindable(false),
		    parentLoading = false,
		    loader,
		    children,
		    onError
	    }: Props = $props()

	let oldData: TData = $state()

	let lazyTask: Promise<TData> = $state()


	function showLoader() {
		setLoading(true)
	}

	function hideLoader() {
		setLoading(false)
	}

	function setLoading(loading_: boolean) {
		loading = loading_

		if (parentLoading) {
			context?.setLoading(loading_)
		}
	}

	run(() => {
		lazyTask =
			(task && lazyLoader<TData>(task, showLoader, hideLoader, $Config.lazyLoader)) ||
			(emptyPromise as Promise<TData>)
	})
	run(() => {
		lazyTask?.then(x => {
			oldData = x as TData
		})
	})
</script>

{#await lazyTask}
	{#if loading && !parentLoading}
		{#if loader}
			{@render loader()}
		{:else}
			<Loader />
		{/if}
	{:else}
		{@render children?.(oldData)}
	{/if}
{:then data}
	{@render children?.(data)}
{:catch error}
	{@render onError?.(error)}
{/await}
