<script lang="ts">
	import {LteButton} from "@keenmate/svelte-adminlte"
	import {_} from "svelte-i18n"

	export let xsmall = false
	export let small  = false
	export let large  = false

	$: noSizeSet = !xsmall && !small && !large
</script>

<LteButton
	color="success"
	title={$_("common.buttons.add")}
	{xsmall}
	small={small || noSizeSet}
	{large}
	{...$$restProps}
	on:click
>
	<i class="fas fa-plus fa-fw" />
	<slot />
</LteButton>
