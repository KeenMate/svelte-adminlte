<script lang="ts">
	import {createEventDispatcher} from "svelte"
	import LteButton from "./LteButton.svelte"
	
	const dispatch = createEventDispatcher()

	export let action: (<T>() => Promise<T>) | null
	export let enabledWhenLoading = false

	export let iconClass: string | null = null
	export let disabled: boolean = false
	export let loading: boolean = false

	$: computedDisabled = disabled
		|| (enabledWhenLoading ? false : loading)

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

<LteButton {...$$restProps} disabled={computedDisabled} on:click={onClick}>
	{#if loading}
		<i class="fas fa-circle-notch fa-spin fa-fw" style="--fa-animation-duration: 1s"></i>
	{:else if iconClass}
		<i class="{iconClass} fa-fw"></i>
	{/if}

	<slot/>
</LteButton>
