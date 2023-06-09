<script>
	import {createEventDispatcher} from "svelte"

	const dispatch = createEventDispatcher()
	
	export let username = null
	export let datetime = null
	export let avatar = null
	export let avatarAlt = null
	export let message = null
	export let right = false
</script>

<div
	class="direct-chat-msg {$$restProps.class || ''}"
	class:right
	on:click
>
	<div class="direct-chat-infos clearfix">
		<span
			class="direct-chat-name float-left"
			on:click={ev => dispatch("usernameClick", ev)}
		>
			{username || ""}
		</span>
		<span
			class="direct-chat-timestamp float-right"
			on:click={ev => dispatch("datetimeClick", ev)}
		>
			{datetime || ""}
		</span>
	</div>
	<slot name="avatar">
		{#if avatar || avatarAlt}
			<img
				class="direct-chat-img"
				src={avatar || ""}
				alt={avatarAlt || ""}
	      on:click={ev => dispatch("avatarClick", ev)}
			>
		{/if}
	</slot>
	<div
		class="direct-chat-text"
		on:click={ev => dispatch("chatBodyClicked", ev)}
	>
		<slot>
			{message || ""}
		</slot>
	</div>
</div>
