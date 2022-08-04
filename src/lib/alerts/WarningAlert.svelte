<script>
	import BaseAlert from './BaseAlert.svelte';

	export let header = '';
	export let closeable = true;
</script>

<BaseAlert {closeable} {header} icon="exclamation-triangle" level="warning" on:closed>
	<slot />
</BaseAlert>
