<script lang="ts">
	import {Config} from "$lib/config.js"
	
	export let permission: string[] | string
	export let comparison = $Config.permissions.defaultComparison

	$: currentUser = $Config.currentUser
	$: sanitizedPermission = ((typeof permission === "string" && [permission]) ||
		permission) as string[]

	$: isVisible = $Config.permissions.permissionCheck(currentUser?.roles, {
		[comparison]: sanitizedPermission
	})
</script>

{#if isVisible}
	<slot />
{/if}
