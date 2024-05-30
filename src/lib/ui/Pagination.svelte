<script lang="ts">
	import {createEventDispatcher} from "svelte"

	const dispatch = createEventDispatcher()

	const minPage = 1

	export let page: number
	export let pages: number
	export let visiblePagesCount = 5
	export let showEllipsis      = false

	$: leftBorder = Math.max(page - visiblePagesCount, minPage)
	$: rightBorder = Math.min(page + visiblePagesCount, pages)
	$: visiblePages = visiblePageArray(leftBorder, rightBorder)

	function visiblePageArray(leftBorder: number, rightBorder: number) {
		const buffer = []

		for (let i = leftBorder; i <= rightBorder; i++) {
			buffer.push(i)
		}

		return buffer
	}

	function onStepFromPage(step: number) {
		const resultPage = page + step

		if (resultPage < minPage) {
			updateCurrentPage(minPage)
			return
		}

		if (resultPage > pages) {
			updateCurrentPage(pages)
			return
		}

		updateCurrentPage(resultPage)
	}

	function updateCurrentPage(page: number) {
		dispatch("updatePage", page)
	}
</script>

<ul class="pagination {$$props.class || ''}">
	<li class="page-item">
		<!-- svelte-ignore a11y-invalid-attribute -->
		<!-- eslint-disable-next-line -->
		<a class="page-link" href="javascript:void(0)" on:click|preventDefault={() => onStepFromPage(-10)}>
			<i class="fas fa-angle-double-left" />
		</a>
	</li>
	<li class="page-item">
		<!-- svelte-ignore a11y-invalid-attribute -->
		<!-- eslint-disable-next-line -->
		<a class="page-link" href="javascript:void(0)" on:click|preventDefault={() => onStepFromPage(-1)}>
			<i class="fas fa-chevron-left" />
		</a>
	</li>

	{#if showEllipsis && visiblePages[0] > 1}
		<li class="page-item">
			<!-- svelte-ignore a11y-invalid-attribute -->
			<!-- eslint-disable-next-line -->
			<a href="javascript:void(0)" class="page-link" on:click|preventDefault={() => updateCurrentPage(1)}> 1 </a>
		</li>
		<li class="page-item disabled">
			<!-- svelte-ignore a11y-invalid-attribute -->
			<!-- eslint-disable-next-line -->
			<a href="javascript:void(0)" class="page-link"> &hellip; </a>
		</li>
	{/if}

	{#each visiblePages as visiblePage (visiblePage)}
		<li
			class="page-item"
			class:active={visiblePage === page}
			on:click|preventDefault={() => updateCurrentPage(visiblePage)}
		>
			<!-- svelte-ignore a11y-invalid-attribute -->
			<!-- eslint-disable-next-line -->
			<a href="javascript:void(0)" class="page-link">
				{visiblePage}
			</a>
		</li>
	{/each}

	{#if showEllipsis && visiblePages[visiblePages.length - 1] < pages}
		<li class="page-item disabled">
			<!-- svelte-ignore a11y-invalid-attribute -->
			<!-- eslint-disable-next-line -->
			<a href="javascript:void(0)" class="page-link"> &hellip; </a>
		</li>
		<li class="page-item">
			<!-- svelte-ignore a11y-invalid-attribute -->
			<!-- eslint-disable-next-line -->
			<a href="javascript:void(0)" class="page-link" on:click|preventDefault={() => updateCurrentPage(pages)}>
				{pages}
			</a>
		</li>
	{/if}

	<li class="page-item">
		<!-- svelte-ignore a11y-invalid-attribute -->
		<!-- eslint-disable-next-line -->
		<a class="page-link" href="javascript:void(0)" on:click|preventDefault={() => onStepFromPage(1)}>
			<i class="fas fa-chevron-right" />
		</a>
	</li>
	<li class="page-item">
		<!-- svelte-ignore a11y-invalid-attribute -->
		<!-- eslint-disable-next-line -->
		<a class="page-link" href="javascript:void(0)" on:click|preventDefault={() => onStepFromPage(10)}>
			<i class="fas fa-angle-double-right" />
		</a>
	</li>
</ul>
