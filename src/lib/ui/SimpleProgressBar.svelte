<script lang="ts">
	import {getAccentClass} from "../helpers/class-helpers.js"
	import {Accents} from "../types/global.d.ts"

	export let width: string   = "0"
	export let accent: Accents = Accents.None

	const accentClass = accent !== Accents.None ? getAccentClass(accent) : ""
</script>

<div class="progress">
	<div class="progress-bar {accentClass}" style="width:{width}"></div>
</div>
