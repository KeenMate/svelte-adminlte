<script lang="ts">
	import useActions from "$lib/actions/use-actions.js"
	
	export let href: string | null = "#"
	export let icon: string | null = null
	export let active: boolean = false
	export let tooltip: string | null = ""
	export let target: string | null = ""
	export let use: ((node: HTMLElement) => any) | undefined = undefined
</script>

<li class="nav-item" data-toggle="tooltip" data-placement="right" title={tooltip}>
	<a
		class="nav-link"
		class:active
		{href}
		{target}
		{...$$restProps}
		use:useActions={use}
	>
		{#if icon}
			<i class="nav-icon {icon}" />
		{:else}
			<slot name="icon" />
		{/if}

		<slot />
	</a>
</li>
