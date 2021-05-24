<script>
	
		import BaseAlert from "./BaseAlert.svelte"
		
		export let header = ""
		export let closeable = true

</script>


<BaseAlert
	{header}
	{closeable}
	level="warning"
	icon="exclamation-triangle"
	on:closed
>
	<slot />
</BaseAlert>