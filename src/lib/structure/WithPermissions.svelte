<script lang="ts">
	import {Config} from "$lib/config.js"

	export let permission: string[] | string
	export let comparison: string | null = null

	$: currentUser = $Config.currentUser
	$: sanitizedPermission = ((typeof permission === "string" && [permission]) ||
		permission) as string[]

	$: isVisible = $Config.permissions.permissionCheck(currentUser?.permissions, {
		[comparison || $Config.permissions.defaultComparison]: sanitizedPermission
	})
</script>

{#if isVisible}
	<slot />
{/if}
