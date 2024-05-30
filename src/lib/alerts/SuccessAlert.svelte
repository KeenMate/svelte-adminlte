<script lang="ts">
	import BaseAlert from "./BaseAlert.svelte"

	export let header    = ""
	export let closeable = true
</script>

<BaseAlert {closeable} {header} icon="check" level="success" on:closed>
	<slot />
</BaseAlert>
