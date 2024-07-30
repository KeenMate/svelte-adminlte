<script lang="ts">
	export let color = ""
	export let title = ""
	export let classes = ""
</script>

<span class="label {(color && 'label-' + color) || ''} {classes || ''}" {title}>
	<slot />
</span>
