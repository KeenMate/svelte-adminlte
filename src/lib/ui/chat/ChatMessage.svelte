<script>
	export let username = null
	export let datetime = null
	export let avatar = null
	export let avatarAlt = null
	export let message = null
	export let right = false
</script>

<div class="direct-chat-msg" class:right>
	<div class="direct-chat-infos clearfix">
		<span class="direct-chat-name float-left">{username || ""}</span>
		<span class="direct-chat-timestamp float-right">{datetime || ""}</span>
	</div>
	<slot name="avatar">
		<img class="direct-chat-img" src={avatar || ""} alt={avatarAlt || ""}>
	</slot>
	<div class="direct-chat-text">
		<slot>
			{message || ""}
		</slot>
	</div>
</div>
