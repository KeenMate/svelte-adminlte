<script lang="ts">
	import {Config} from "$lib/config.js"

	type Props = {
		permission: string[] | string;
		comparison?: string | null;
		children?: import("svelte").Snippet;
		unmatched?: import("svelte").Snippet;
	}

	let {
		    permission,
		    comparison = null,
		    children,
		    unmatched
	    }: Props = $props()

	let sanitizedPermission = $derived(((typeof permission === "string" && [permission]) ||
		permission) as string[])

	let isVisible = $derived($Config.permissions.checkRoles($Config.currentUser, {
		[comparison || $Config.permissions.defaultComparison]: sanitizedPermission
	}))
</script>

{#if isVisible}
	{@render children?.()}
{:else}
	{@render unmatched?.()}
{/if}
