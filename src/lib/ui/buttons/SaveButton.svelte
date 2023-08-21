<script>
	import {_} from "svelte-i18n"
	import LteButton from "./LteButton.svelte";

	export let type = "submit"
	export let short = false
</script>

<LteButton
	color="success"
	{type}
	small
	title={$_("common.buttons.save")}
	{...$$restProps}
	on:click
>
	<slot>
		<i class="fas fa-save fa-fw" />
		{#if !short}
			{$_("common.buttons.save")}
		{/if}
	</slot>
</LteButton>
