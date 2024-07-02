<script lang="ts">
	export let href: string | null = null
	export let active              = false
	export let disabled            = false
</script>

<li>
	<a
		{href}
		{...$$restProps}
		class="dropdown-item"
		class:active
		class:disabled
		on:click
	>
		<slot />
	</a>
</li>
