<script lang="ts">
	import {updateQuerystringPartial} from "@keenmate/js-common-helpers/helpers/router.js"
	import {_} from "svelte-i18n"

	let { filtersVisible } = $props();
</script>

<a
	href="javascript:void(0)"
	onclick={() => updateQuerystringPartial({filtersVisible: !filtersVisible})}
>
	{#if filtersVisible}
		{$_("common.labels.hideFilters")}
	{:else}
		{$_("common.labels.showFilters")}
	{/if}
</a>
