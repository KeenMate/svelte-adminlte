<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	interface Props {
		[key: string]: any
	}

	let { ...rest }: Props = $props();

</script>

<span
	{...rest}
	class="btn close-icon-button has-text-danger {rest.class || ''}"
	onclick={bubble('click')}
>
	<i class="fas fa-times fa-2x"></i>
</span>


