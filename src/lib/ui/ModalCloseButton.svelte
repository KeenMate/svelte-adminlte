<button
	type="button"
	data-dismiss="modal"
	{...$$props}
	class="btn btn-default btn-sm pull-left {$$props.class || ''}"
>
	<slot>Close</slot>
</button>
