<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot making the component unusable -->
<script lang="ts">
	import BaseAlert from "./BaseAlert.svelte"
	import {Config} from "$lib/config.js"

	export let header: string | undefined = undefined
	export let icon: string | undefined = undefined
	export let level: string | undefined = undefined
	export let closeable: boolean | undefined = undefined

	$: alertBaseDefaults = $Config.defaults?.alerts?.base || {}
	$: specialAlertDefaults = $Config.defaults?.alerts?.warning || {}
	$: iconClass = icon || specialAlertDefaults.iconClass || alertBaseDefaults.iconClass
	$: computedLevel = level || specialAlertDefaults.level || alertBaseDefaults.level
</script>

<BaseAlert
	{header}
	icon={iconClass}
	level={computedLevel}
	{closeable}
	on:closed
>
	<slot name="header" slot="header" />
	<slot />
</BaseAlert>
