<script>
	import {LteButton} from "../../index"

	export let color = null
</script>

<LteButton
	{color}
	toggle="dropdown"
	aria-expanded="false"
	{...$$restProps}
	class="dropdown-toggle {$$props.class || ''}"
>
	<slot></slot>
	<!--<span class="caret"></span>-->
</LteButton>
