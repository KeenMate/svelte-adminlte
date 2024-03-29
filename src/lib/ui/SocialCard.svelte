<script lang="ts">
	import {Badge} from "$lib/index"
	import {Accents} from "../types/global.d.ts"

	export let image: string = ""
	export let username: string = ""
	export let description: string = ""

	type FooterItem = {title: string; amount: string | number}

	export let footerItems: FooterItem[] = []
	export let badgeColor: string = ""

	export let horizontalLayout: boolean = false

	export let headerColor:Accents = Accents.None
</script>

<div class="card card-widget {horizontalLayout ? 'widget-user' : 'widget-user-2'}">
	<div class="widget-user-header bg-warning">
		<div class="widget-user-image">
			{#if image !== ""}
				<img
					class="img-circle elevation-2"
					src={image}
					alt="social-card"
				/>
			{/if}
			<h3 class="widget-user-username">{username}</h3>
			<h5 class="widget-user-desc">{description}</h5>
		</div>
	</div>
	{#if footerItems}
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
	{/if}
</div>
