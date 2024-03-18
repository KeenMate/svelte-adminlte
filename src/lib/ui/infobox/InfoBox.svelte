<script lang="ts">
	import {getAccentClass} from "../../helpers/class-helpers.ts"
	import {Shadow} from "../../types/global.d.ts"
	import {Accents} from "../../types/global.d.ts"

	export let textCenter: boolean = false
	export let text: string = ""

	export let accent: Accents = Accents.None

	export let color: string = ""
	export let backgroundColor: string = ""
	export let imageBackgroundColor: string = ""

	export let shadow: Shadow = Shadow.None
	export let icon: string = ""
	export let smallBox: boolean = false

	const accentClass = accent !== Accents.None ? getAccentClass(accent) : ""
	const backgroundStyle =
		accent === Accents.None ? `background-color: ${backgroundColor}; color: ${color};` : ""
	const iconBackgroundStyle =
		accent === Accents.None ? `background-color: ${imageBackgroundColor};` : ""
</script>

<div
	class="info-box {shadow ? 'shadow-' + shadow : ''} {accentClass}"
	class:small-box={smallBox}
	style="{backgroundStyle}"
>
	<span
		class="info-box-icon"
		style="{iconBackgroundStyle}"
	>
		{#if icon !== ""}
			<i class={icon} />
		{:else}
			<slot name="image" />
		{/if}
	</span>
	<div
		class="info-box-content"
		class:text-center-aligned={textCenter}
	>
		{#if $$slots.number && smallBox}
			<div class="info-box-number">
				<slot name="number" />
			</div>
		{/if}
		<span class="info-box-text">
			{#if smallBox}
				<p>{text}</p>
			{:else}
				{text}
			{/if}
		</span>
		{#if $$slots.number && !smallBox}
			<div class="info-box-number">
				<slot name="number" />
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.info-box {
		.info-box-content {
			&.text-center-aligned {
				display: flex;
				justify-content: center;
				align-items: center;
				min-height: 90px;
			}
		}

		&.small-box {
			.info-box-icon {
				order: 2;
				color: rgba(0, 0, 0, 0.15);
				font-size: 70px;
				margin-right: 16px;
			}

			.info-box-content {
				order: 1;

				.info-box-number {
					font-size: 1.5em;
					margin-bottom: 16px;
				}

				.info-box-text {
					margin-bottom: 16px;
				}
			}
		}
	}
</style>
