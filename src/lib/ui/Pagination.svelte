<script lang="ts">
	import {preventDefault} from "svelte/legacy"

	import {createEventDispatcher} from "svelte"

	const dispatch = createEventDispatcher()

	const minPage = 1

	type Props = {
		page: number;
		pages: number;
		visiblePagesCount?: number;
		showEllipsis?: boolean;

		[key: string]: any
	}

	let {
		    page,
		    pages,
		    visiblePagesCount = 5,
		    showEllipsis      = false,
		    ...restProps
	    }: Props = $props()


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

	let leftBorder   = $derived(Math.max(page - visiblePagesCount, minPage))
	let rightBorder  = $derived(Math.min(page + visiblePagesCount, pages))
	let visiblePages = $derived(visiblePageArray(leftBorder, rightBorder))
</script>

<ul class="pagination {restProps.class || ''}">
	<li class="page-item">
		<!-- svelte-ignore a11y_invalid_attribute -->
		<!-- eslint-disable-next-line -->
		<a class="page-link" href="javascript:void(0)" onclick={preventDefault(() => onStepFromPage(-10))}>
			<i class="fas fa-angle-double-left"></i>
		</a>
	</li>
	<li class="page-item">
		<!-- svelte-ignore a11y_invalid_attribute -->
		<!-- eslint-disable-next-line -->
		<a class="page-link" href="javascript:void(0)" onclick={preventDefault(() => onStepFromPage(-1))}>
			<i class="fas fa-chevron-left"></i>
		</a>
	</li>

	{#if showEllipsis && visiblePages[0] > 1}
		<li class="page-item">
			<!-- svelte-ignore a11y_invalid_attribute -->
			<!-- eslint-disable-next-line -->
			<a href="javascript:void(0)" class="page-link" onclick={preventDefault(() => updateCurrentPage(1))}> 1 </a>
		</li>
		<li class="page-item disabled">
			<!-- svelte-ignore a11y_invalid_attribute -->
			<!-- eslint-disable-next-line -->
			<a href="javascript:void(0)" class="page-link"> &hellip; </a>
		</li>
	{/if}

	{#each visiblePages as visiblePage (visiblePage)}
		<li
			class="page-item"
			class:active={visiblePage === page}
			onclick={preventDefault(() => updateCurrentPage(visiblePage))}
		>
			<!-- svelte-ignore a11y_invalid_attribute -->
			<!-- eslint-disable-next-line -->
			<a href="javascript:void(0)" class="page-link">
				{visiblePage}
			</a>
		</li>
	{/each}

	{#if showEllipsis && visiblePages[visiblePages.length - 1] < pages}
		<li class="page-item disabled">
			<!-- svelte-ignore a11y_invalid_attribute -->
			<!-- eslint-disable-next-line -->
			<a href="javascript:void(0)" class="page-link"> &hellip; </a>
		</li>
		<li class="page-item">
			<!-- svelte-ignore a11y_invalid_attribute -->
			<!-- eslint-disable-next-line -->
			<a href="javascript:void(0)" class="page-link" onclick={preventDefault(() => updateCurrentPage(pages))}>
				{pages}
			</a>
		</li>
	{/if}

	<li class="page-item">
		<!-- svelte-ignore a11y_invalid_attribute -->
		<!-- eslint-disable-next-line -->
		<a class="page-link" href="javascript:void(0)" onclick={preventDefault(() => onStepFromPage(1))}>
			<i class="fas fa-chevron-right"></i>
		</a>
	</li>
	<li class="page-item">
		<!-- svelte-ignore a11y_invalid_attribute -->
		<!-- eslint-disable-next-line -->
		<a class="page-link" href="javascript:void(0)" onclick={preventDefault(() => onStepFromPage(10))}>
			<i class="fas fa-angle-double-right"></i>
		</a>
	</li>
</ul>
