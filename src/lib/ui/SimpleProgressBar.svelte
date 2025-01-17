<script lang="ts">
	import {getAccentClass} from "../helpers/class-helpers.js"
	import {Accents} from "../constants/index.js"

	interface Props {
		width?: string;
		accent?: Accents;
	}

	let { width = "0", accent = Accents.None }: Props = $props();

	const accentClass = accent !== Accents.None ? getAccentClass(accent) : ""
</script>

<div class="progress">
	<div class="progress-bar {accentClass}" style="width:{width}"></div>
</div>
