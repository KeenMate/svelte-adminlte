<script lang="ts">
	import {Config} from "$lib/config.js"

	export let permission: string[] | string
	export let comparison: string | null = null

	$: sanitizedPermission = ((typeof permission === "string" && [permission]) ||
		permission) as string[]

	$: isVisible = $Config.permissions.checkPermissions($Config.currentUser, {
		[comparison || $Config.permissions.defaultComparison]: sanitizedPermission
	})
</script>

{#if isVisible}
	<slot />
{:else}
	<slot name="else" />
{/if}
