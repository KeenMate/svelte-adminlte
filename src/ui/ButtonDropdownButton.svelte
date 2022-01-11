<script>
	import {LteButton} from "../../index"

	export let color = null
</script>

<LteButton class="dropdown-toggle" {color} toggle="dropdown" {...$$restProps}>
	<slot></slot>
	<span class="caret"></span>
</LteButton>
