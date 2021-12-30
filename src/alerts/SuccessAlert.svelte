<script>
		import BaseAlert from "./BaseAlert.svelte"
		
		export let header = ""
		export let closeable = true

</script>


<BaseAlert
	{header}
	{closeable}
	level="success"
	icon="check"
	on:closed
>
	<slot />
</BaseAlert>