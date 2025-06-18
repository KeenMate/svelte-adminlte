<script lang="ts">
	type Props = {
		onClick?: (ev: Event) => void
		[key: string]: any
	}

	let {
		    onClick = undefined,
		    ...restProps
	}: Props = $props()

</script>

<span
	{...restProps}
	class="btn close-icon-button has-text-danger {restProps.class || ''}"
	onclick={onClick}
>
	<i class="fas fa-times fa-2x"></i>
</span>


