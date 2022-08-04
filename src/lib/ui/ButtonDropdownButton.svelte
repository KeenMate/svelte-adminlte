<script>
	import LteButton from './LteButton.svelte';
</script>

<LteButton
	toggle="dropdown"
	aria-expanded="false"
	{...$$restProps}
	class="dropdown-toggle {$$props.class || ''}"
>
	<slot />
	<!--<span class="caret"></span>-->
</LteButton>
