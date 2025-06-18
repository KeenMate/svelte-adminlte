<script lang="ts">
	type Props = {
		username?: any;
		datetime?: any;
		avatarImageSrc?: any;
		avatarAlt?: any;
		message?: any;
		right?: boolean;
		avatar?: import("svelte").Snippet;
		children?: import("svelte").Snippet;
		onClick?: (ev: Event) => void
		onUsernameClick?: (ev: Event) => void
		onDatetimeClick?: (ev: Event) => void
		onAvatarClick?: (ev: Event) => void
		onChatBodyClick?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    username       = null,
		    datetime       = null,
		    avatarImageSrc = null,
		    avatarAlt      = null,
		    message        = null,
		    right          = false,
		    avatar,
		    children,
		    onClick = undefined,
		    onUsernameClick = undefined,
		    onDatetimeClick = undefined,
		    onAvatarClick = undefined,
		    onChatBodyClick = undefined,
		    ...restProps
	    }: Props = $props()
</script>

<div class="direct-chat-msg {restProps.class || ''}" class:right onclick={onClick}>
	<div class="direct-chat-infos clearfix">
		<span class="direct-chat-name float-left" onclick={onUsernameClick}>
			{username || ""}
		</span>
		<span class="direct-chat-timestamp float-right" onclick={onDatetimeClick}>
			{datetime || ""}
		</span>
	</div>
	{#if avatar}{@render avatar()}{:else}
		{#if avatarImageSrc || avatarAlt}
			<img
				class="direct-chat-img"
				src={avatarImageSrc || ""}
				alt={avatarAlt || ""}
				onclick={onAvatarClick}
			/>
		{/if}
	{/if}
	<div class="direct-chat-text" onclick={onChatBodyClick}>
		{#if children}{@render children()}{:else}
			{message || ""}
		{/if}
	</div>
</div>
