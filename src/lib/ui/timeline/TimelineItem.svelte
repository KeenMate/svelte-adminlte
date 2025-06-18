<script lang="ts">
	type Props = {
		iconClasses?: any;
		time?: import("svelte").Snippet;
		header?: import("svelte").Snippet;
		children?: import("svelte").Snippet;
		footer?: import("svelte").Snippet;
	}

	let {
		    iconClasses = null,
		    time,
		    header,
		    children,
		    footer
	    }: Props = $props()
</script>

<li>
	<i class={iconClasses || ""}></i>

	<div class="timeline-item">
		{#if time}
			<span class="time">
				<i class="fa fa-clock-o"></i>
				{@render time?.()}
			</span>
		{/if}

		{#if header}
			<h3 class="timeline-header">
				{@render header?.()}
			</h3>
		{/if}

		<div class="timeline-body">
			{@render children?.()}
		</div>

		{#if footer}
			<div class="timeline-footer">
				{@render footer?.()}
			</div>
		{/if}
	</div>
</li>
