<script>
	import {ButtonDropdownButton} from "../../index"

	export let text = ""
</script>

<div class="btn-group">
	<slot>
		<ButtonDropdownButton>
			{text}
		</ButtonDropdownButton>
	</slot>
	<ul class="dropdown-menu" role="menu">
		<slot />
	</ul>
</div>
