<script lang="ts">
	type Props = {
		checked?: boolean;
		group?: any;
		indeterminate?: boolean;
		id?: string;
		value?: string;
		name?: string;
		disabled?: boolean;
		level?: string;
		children?: import("svelte").Snippet;
		onChange?: (ev: Event) => void
		onClick?: (ev: Event) => void
		onFocusin?: (ev: Event) => void
		onFocusout?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    checked       = false,
		    group         = null,
		    indeterminate = false,
		    id            = "",
		    value         = "",
		    name          = "",
		    disabled      = false,
		    level         = "primary",
		    children,
		    onChange = undefined,
		    onClick = undefined,
		    onFocusin = undefined,
		    onFocusout = undefined,
		    ...restProps
	    }: Props = $props()

	let classContainsFlex = $derived(restProps.class?.split(" ").some((x: string) => /flex/.test(x)) || false)
</script>

<div
	{...restProps}
	class="icheck-{level} {classContainsFlex ? '' : 'd-flex align-items-center'} {restProps.class || ''}"
>
	<input
		type="checkbox"
		{checked}
		{indeterminate}
		{id}
		{group}
		{value}
		{name}
		{disabled}
		onchange={onChange}
		onclick={onClick}
		onfocusin={onFocusin}
		onfocusout={onFocusout}
	>
	<label for={id}>
		{@render children?.()}
	</label>
</div>

<style lang="scss">
	label {
		gap: 0.25rem;
	}
</style>
