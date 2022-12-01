<table
	{...$$restProps}
	class="table table-sm data-table {$$props.class || ''}" 
>
	<thead>
	<slot name="headers" />
	</thead>
	<tbody>
	<slot />
	</tbody>
	<slot name="footer" />
</table>
