<script lang="ts">
	import BaseAlert from "./BaseAlert.svelte"

	export let header = ""
	export let closeable: boolean | undefined = undefined
</script>

<BaseAlert
	{header}
	icon="info"
	level="info"
	{closeable}
	on:closed
>
	<slot name="header" slot="header" />
	<slot />
</BaseAlert>
