<script>
	import {LteButton} from "../../index"
</script>

<LteButton
	toggle="dropdown"
	aria-expanded="false"
	{...$$restProps}
	class="dropdown-toggle {$$props.class || ''}"
>
	<slot></slot>
	<!--<span class="caret"></span>-->
</LteButton>
