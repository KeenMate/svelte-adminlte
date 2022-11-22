<script>
	import {createEventDispatcher} from "svelte"

	const dispatch = createEventDispatcher()
	
	const minPage = 1

	export let page
	export let pages
	export let visiblePagesCount = 5
	export let showEllipsis = false

	$: leftBorder = Math.max(page - visiblePagesCount, minPage)
	$: rightBorder = Math.min(page + visiblePagesCount, pages)
	$: visiblePages = visiblePageArray(leftBorder, rightBorder)

	function visiblePageArray(leftBorder, rightBorder) {
		const buffer = []

		for (let i = leftBorder; i < rightBorder; i++) {
			buffer.push(i)
		}

		return buffer
	}

	function onStepFromPage(step) {
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

	function updateCurrentPage(page) {
		dispatch("updatePage", page)
	}
</script>

<ul class="pagination {$$props.class || ''}">
	<li class="page-item">
		<a class="page-link" href="#" on:click|preventDefault={() => onStepFromPage(-10)}>
			<i class="fas fa-angle-double-left" />
		</a>
	</li>
	<li class="page-item">
		<a class="page-link" href="#" on:click|preventDefault={() => onStepFromPage(-1)}>
			<i class="fas fa-chevron-left" />
		</a>
	</li>

	{#if showEllipsis && visiblePages[0] > 1}
		<li class="page-item">
			<a href="#" class="page-link" on:click|preventDefault={() => updateCurrentPage(1)}> 1 </a>
		</li>
		<li class="page-item disabled">
			<a href="#" class="page-link"> &hellip; </a>
		</li>
	{/if}

	{#each visiblePages as visiblePage (visiblePage)}
		<li
			class="page-item"
			class:active={visiblePage === page}
			on:click|preventDefault={() => updateCurrentPage(visiblePage)}
		>
			<a href="#" class="page-link">
				{visiblePage}
			</a>
		</li>
	{/each}

	{#if showEllipsis && visiblePages[visiblePages.length - 1] < pages}
		<li class="page-item disabled">
			<a href="#" class="page-link"> &hellip; </a>
		</li>
		<li class="page-item">
			<a href="#" class="page-link" on:click|preventDefault={() => updateCurrentPage(pages)}>
				{pages}
			</a>
		</li>
	{/if}

	<li class="page-item">
		<a class="page-link" href="#" on:click|preventDefault={() => onStepFromPage(1)}>
			<i class="fas fa-chevron-right" />
		</a>
	</li>
	<li class="page-item">
		<a class="page-link" href="#" on:click|preventDefault={() => onStepFromPage(10)}>
			<i class="fas fa-angle-double-right" />
		</a>
	</li>
</ul>
