<script lang="ts">
	import {updateQuerystringPartial} from "@keenmate/js-common-helpers/helpers/router.js"
	import {_} from "svelte-i18n"

	export let filtersVisible
</script>

<a
	href="javascript:void(0)"
	on:click={() => updateQuerystringPartial({filtersVisible: !filtersVisible})}
>
	{#if filtersVisible}
		{$_("common.labels.hideFilters")}
	{:else}
		{$_("common.labels.showFilters")}
	{/if}
</a>
