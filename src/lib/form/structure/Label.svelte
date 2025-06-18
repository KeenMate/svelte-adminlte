<script lang="ts">
	type Props = {
		inputId?: string;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {inputId = "", children, ...restProps}: Props = $props()
</script>

<label class={restProps.class || ""} for={inputId}>
	{@render children?.()}
</label>
