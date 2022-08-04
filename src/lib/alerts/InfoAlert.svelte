<script>
	import BaseAlert from './BaseAlert.svelte';

	export let header = '';
	export let closeable = true;
</script>

<BaseAlert {closeable} {header} icon="info" level="info" on:closed>
	<slot />
</BaseAlert>
