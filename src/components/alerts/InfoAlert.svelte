<script>
		import BaseAlert from "./BaseAlert.svelte"
		
		export let header = ""
		export let closeable = true

</script>


<BaseAlert
	{header}
	{closeable}
	level="info"
	icon="info"
	on:closed
>
	<slot />
</BaseAlert>