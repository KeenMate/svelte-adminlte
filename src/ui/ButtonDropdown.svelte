<script>
	import {DropdownButton} from "../.."

	export let text = ""
</script>

<div class="btn-group">
	<slot>
		<DropdownButton>
			{text}
		</DropdownButton>
	</slot>
	<ul class="dropdown-menu" role="menu">
		<slot />
	</ul>
</div>
