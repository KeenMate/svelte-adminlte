<script lang="ts">
	import BaseAlert from "./BaseAlert.svelte"

	export let header    = ""
	export let closeable: boolean | undefined = undefined
</script>

<BaseAlert
	{header}
	icon="check"
	level="success"
	{closeable}
	on:closed
>
	<slot name="header" slot="header" />
	<slot />
</BaseAlert>
