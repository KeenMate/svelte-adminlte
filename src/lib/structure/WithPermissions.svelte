<script type="ts">
	import {getConfig} from "$lib/config.js"

	const {permissions: config, currentUser} = getConfig()
	export let permission: string[] | string
	export let comparison = config.defaultComparison

	$: sanitizedPermission = ((typeof permission === "string" && [permission]) ||
		permission) as string[]

	$: isVisible = config.permissionCheck($currentUser?.permissions, {
		[comparison]: sanitizedPermission
	})
</script>

{#if isVisible}
	<slot />
{/if}
