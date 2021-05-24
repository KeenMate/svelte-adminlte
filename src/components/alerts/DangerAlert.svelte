<script>
		import BaseAlert from "./BaseAlert.svelte"
		
		export let header = ""
		export let closeable = true

</script>


<BaseAlert
	{header}
	{closeable}
	level="danger"
	icon="ban"
	on:closed
>
	<slot />
</BaseAlert>