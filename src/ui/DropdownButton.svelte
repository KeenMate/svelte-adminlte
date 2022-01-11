<script>
	import {LteButton} from "../.."

	export let color = null
</script>

<LteButton {color} class="dropdown-toggle" toggle="dropdown" {...$$restProps}>
	<slot></slot>
	<span class="caret"></span>
</LteButton>
