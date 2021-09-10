<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let page;
  export let pages;
  export let pageSize;
  export let visiblePagesCount = 5;

  $: leftBorder = Math.max(this.page - this.visiblePagesCount, 1);
  $: rightBorder = Math.min(this.page + this.visiblePagesCount, this.pages);
  $: visiblePages = visiblePageArray(leftBorder, rightBorder);

  function visiblePageArray(leftBorder, rightBorder) {
    const buffer = [];

    for (let i = leftBorder; i <= rightBorder; i++) {
      buffer.push(i);
    }

    return buffer;
  }

  function onStepFromPage(step) {
    const resultPage = page + step;

    if (resultPage < 0 || resultPage >= this.pages) return;

    this.updateCurrentPage(resultPage);
  }

  function updateCurrentPage(page) {
    dispatch("updatePage", page);
  }
</script>

<!-- <script>
	export default {
		name: "Pagination",
		props: {
			/**
			 * @description Page number (not index)
			 */
			page: Number,
			/**
			 * @description Number of available pages
			 */
			pages: Number,
			pageSize: Number,
			/**
			 * @description Amount of pages to display on each side of current page
			 */
			visiblePagesCount: {
				type: Number,
				default: 5
			}
		},
		computed: {
			visiblePages() {
				let leftBorder = this.leftBorder
				let rightBorder = this.rightBorder
				const buffer = []
				for (let i = leftBorder; i <= rightBorder; i++)
					buffer.push(i)
				return buffer
			},
			leftBorder() {return Math.max(this.page - this.visiblePagesCount, 1)},
			rightBorder() {return Math.min(this.page + this.visiblePagesCount, this.pages)}
		},
		methods: {
			onStepFromPage(step) {
				const resultPage = this.page + step
				if (resultPage < 0 || resultPage >= this.pages)
					return
				this.updateCurrentPage(resultPage)
			},
			updateCurrentPage(page) {
				this.$emit("update:page", page)
			}
		}
	}
	</script> -->

<ul class="pagination pagination-sm inline">
  <li on:click={onPrevClick}>
    <a>«</a>
  </li>
  <slot />
  <li on:click={onNextClick}>
    <a>»</a>
  </li>
</ul>
