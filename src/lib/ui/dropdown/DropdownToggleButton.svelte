<script lang="ts">
	import LteButton from "$lib/ui/buttons/LteButton.svelte"
</script>

<LteButton
	{...$$restProps}
	class="dropdown-toggle dropdown-icon {$$restProps.class || ''}"
	data-toggle="dropdown"
>
	<span class="sr-only">
		<slot />
	</span>
</LteButton>
