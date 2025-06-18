<script lang="ts">
	type Props = {
		checked?: boolean;
		indeterminate?: boolean;
		id?: string;
		value?: string;
		name?: string;
		disabled?: boolean;
		children?: import("svelte").Snippet;
		onChange?: (ev: Event) => void
		onClick?: (ev: Event) => void
		onFocusin?: (ev: Event) => void
		onFocusout?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    checked       = $bindable(false),
		    indeterminate = $bindable(false),
		    id            = "",
		    value         = "",
		    name          = "",
		    disabled      = false,
		    children = undefined,
		    onChange = undefined,
		    onClick = undefined,
		    onFocusin = undefined,
		    onFocusout = undefined,
		    ...restProps
	    }: Props = $props()
</script>

<div class="{restProps.class || ''}">
	<input
		type="checkbox"
		bind:checked
		bind:indeterminate
		{id}
		{value}
		{name}
		{disabled}
		onchange={onChange}
		onclick={onClick}
		onfocusin={onFocusin}
		onfocusout={onFocusout}
	/>
	<label for={id}>
		{@render children?.()}
	</label>
</div>

<style lang="scss">
	label {
		gap: 0.25rem;
	}
</style>
