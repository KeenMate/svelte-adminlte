<script lang="ts">
	import {getAccentClass} from "../../helpers/class-helpers.js"

	import {Accents, Shadow} from "../../constants/index.js"
	import SimpleProgressBar from "$lib/ui/SimpleProgressBar.svelte"


	type Props = {
		textCenter?: boolean;
		text?: string;
		accent?: Accents;
		color?: string;
		backgroundColor?: string;
		imageBackgroundColor?: string;
		shadow?: Shadow;
		icon?: string;
		smallBox?: boolean;
		progressBar?: boolean;
		progressBarWidth?: string;
		progressBarAccent?: any;
		image?: import("svelte").Snippet;
		number?: import("svelte").Snippet;
	}

	let {
		    textCenter           = false,
		    text                 = "",
		    accent               = Accents.None,
		    color                = "",
		    backgroundColor      = "",
		    imageBackgroundColor = "",
		    shadow               = Shadow.None,
		    icon                 = "",
		    smallBox             = false,
		    progressBar          = false,
		    progressBarWidth     = "",
		    progressBarAccent    = Accents.None,
		    image,
		    number
	    }: Props = $props()

	const accentClass         = accent !== Accents.None ? getAccentClass(accent) : ""
	const backgroundStyle     =
		      accent === Accents.None ? `background-color: ${backgroundColor}; color: ${color};` : ""
	const iconBackgroundStyle =
		      accent === Accents.None ? `background-color: ${imageBackgroundColor};` : ""
</script>

<div
	class="info-box {shadow ? 'shadow-' + shadow : ''} {accentClass}"
	class:small-box={smallBox}
	style={backgroundStyle}
>
	<span
		class="info-box-icon"
		style={iconBackgroundStyle}
	>
		{#if icon !== ""}
			<i class={icon}></i>
		{:else}
			{@render image?.()}
		{/if}
	</span>
	<div
		class="info-box-content"
		class:text-center-aligned={textCenter}
	>
		{#if number && smallBox}
			<div class="info-box-number">
				{@render number?.()}
			</div>
		{/if}
		<span class="info-box-text">
			{#if smallBox}
				<p>{text}</p>
			{:else}
				{text}
			{/if}
		</span>
		{#if number && !smallBox}
			<div class="info-box-number">
				{@render number?.()}
			</div>
		{/if}
		{#if progressBar}
			<SimpleProgressBar width={progressBarWidth} accent={progressBarAccent}></SimpleProgressBar>
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
