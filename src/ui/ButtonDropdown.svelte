<script>
	import {LteButton} from "../.."

	export let text = ""
	export let color = null
</script>

<div class="btn-group">
	<LteButton {color} class="dropdown-toggle" toggle="dropdown">
		<span>{text}</span>
		<span class="caret"></span>
	</LteButton>
	<ul class="dropdown-menu" role="menu">
		<slot />
	</ul>
</div>
