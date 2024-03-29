<script lang="ts">
	import {Badge} from "$lib/index"
	import {Accents} from "../types/global.d.ts"
	import {getAccentClass} from "../helpers/class-helpers.ts"

	export let image: string = ""
	export let username: string = ""
	export let description: string = ""

	type FooterItem = {title: string; amount: string | number}

	export let footerItems: FooterItem[] = []
	export let badgeColor: string = ""

	export let horizontalLayout: boolean = false

	export let headerAccent: Accents = Accents.None
	export let headerAlign: string = ""

	const headerAccentClass = headerAccent !== Accents.None ? getAccentClass(headerAccent) : ""
</script>

<div class="card card-widget {horizontalLayout ? 'widget-user' : 'widget-user-2'}">
	<div class="widget-user-header {headerAccentClass}">
		<div class="widget-user-image">
			{#if image !== ""}
				<img
					class="img-circle elevation-2"
					src={image}
					alt="User Avatar"
				/>
			{/if}
		</div>

		<h3 class="widget-user-username {headerAlign != '' ? 'text-' + headerAlign : ''}">{username}</h3>
		<h5 class="widget-user-desc {headerAlign != '' ? 'text-' + headerAlign : ''}">{description}</h5>
	</div>
	{#if footerItems}
		{#if !horizontalLayout}
			<div class="card-footer p-0">
				<ul class="nav flex-column">
					{#each footerItems as item}
						<li class="nav-item">
							<a
								href="#"
								class="nav-link"
							>
								{item.title}
								<Badge
									color={badgeColor}
									classes="float-right">{item.amount}</Badge
								>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{:else}
			<div class="card-footer">
				<div class="row">
					{#each footerItems.slice(0, 3) as item, i}
						<div class="col-sm-4 {i !== 2 ? 'border-right' : ''}">
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
