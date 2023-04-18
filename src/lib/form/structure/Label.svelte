<script lang="ts">
	export let inputId: string = ""
</script>

<label class={$$props.class || ""} for={inputId}>
	<slot />
</label>
