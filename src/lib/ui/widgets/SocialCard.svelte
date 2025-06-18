<script lang="ts">
	// import {Accents} from "../../constants/index.js"
	import {Accents} from "../../constants/index.js"
	import {getAccentClass} from "../../helpers/class-helpers.js"
	import Badge from "$lib/ui/Badge.svelte"
	import useActions from "$lib/actions/use-actions.js"


	type FooterItem = { title: string; amount: string | number; url: string }


	type Props = {
		image?: string;
		username?: string;
		description?: string;
		footerItems?: FooterItem[];
		badgeColor?: string;
		horizontalLayout?: boolean;
		headerAccent?: Accents;
		headerAlign?: string;
		headerImage?: string;
		use?: ((node: HTMLElement) => any) | undefined;
	}

	let {
		    image            = "",
		    username         = "",
		    description      = "",
		    footerItems      = [],
		    badgeColor       = "",
		    horizontalLayout = false,
		    headerAccent     = Accents.None,
		    headerAlign      = "",
		    headerImage      = "",
		    use              = undefined
	    }: Props = $props()

	let style = $state("")
	if (headerImage) {
		style = `background: url('${headerImage}') center center;`
	}

	const headerAccentClass = headerAccent !== Accents.None ? getAccentClass(headerAccent) : ""
</script>

<div class="card card-widget {horizontalLayout ? 'widget-user' : 'widget-user-2'}">
	<div class="widget-user-header {headerAccentClass}" style="{style}">
		<div class="widget-user-image">
			{#if image !== ""}
				<img
					class="img-circle elevation-2"
					src={image}
					alt="User Avatar"
				/>
			{/if}
		</div>

		<h3 class="widget-user-username {headerAlign != '' ? 'text-' + headerAlign : ''}">
			{username}
		</h3>
		<h5 class="widget-user-desc {headerAlign != '' ? 'text-' + headerAlign : ''}">{description}</h5>
	</div>
	{#if footerItems}
		{#if !horizontalLayout}
			<div class="card-footer p-0">
				<ul class="nav flex-column">
					{#each footerItems as item}
						<li class="nav-item">
							<a
								href={item.url}
								class="nav-link"
								use:useActions={use}
							>
								{item.title}
								<Badge
									color={badgeColor}
									classes="float-right"
								>{item.amount}</Badge
								>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{:else}
			<div class="card-footer">
				<div class="row">
					{#each footerItems as item, i}
						<div
							class={"col-sm-" +
								12 / footerItems.length +
								" " +
								(i !== footerItems.length - 1 ? "border-right" : "")}
						>
							<div class="description-block">
								<h5 class="description-header">{item.amount}</h5>
								<span class="description-text">{item.title}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>
