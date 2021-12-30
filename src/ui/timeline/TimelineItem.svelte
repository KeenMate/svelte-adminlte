<script>
	export let iconClasses = null
</script>

<li>
	<i class={iconClasses || ""}></i>

	<div class="timeline-item">
		{#if $$slots.time}
			<span class="time">
				<i class="fa fa-clock-o"></i>
				<slot name="time" />
			</span>
		{/if}

		{#if $$slots.header}
			<h3 class="timeline-header">
				<slot name="header" />
			</h3>
		{/if}

		<div class="timeline-body">
			<slot />
		</div>

		{#if $$slots.footer}
			<div class="timeline-footer">
				<slot name="footer" />
			</div>
		{/if}
	</div>
</li>
