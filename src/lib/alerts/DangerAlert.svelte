<script lang="ts">
	import BaseAlert from "./BaseAlert.svelte"

	export let header    = ""
	export let closeable = true
</script>

<BaseAlert {closeable} {header} icon="ban" level="danger" on:closed>
	<slot />
</BaseAlert>
