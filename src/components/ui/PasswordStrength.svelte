<script>
	import zxcvbn from "zxcvbn"
	import PasswordValidator from "password-validator"
	import {onDestroy} from "svelte"
	import BsProgress from "./BsProgress.svelte"

	export let passwordElement = null

	// Create a schema
	const schema = new PasswordValidator()

	// Add properties to it
	schema
		.is().min(8)                                    // Minimum length 8
		.is().max(100)                                  // Maximum length 100
		.has().uppercase()                              // Must have uppercase letters
		.has().lowercase()                              // Must have lowercase letters
		.has().digits(1)                                // Must have at least 1 digit

	const messageMap = {
		"min": "Minimum length is 8",
		"max": "Maximum length is 100",
		"uppercase": "Password does not contain uppercase letter",
		"lowercase": "Password does not contain lowercase letter",
		"digits": "Password does not contain number"
	}

	const mapping = {
		0: 20,
		1: 40,
		2: 60,
		3: 80,
		4: 100
	}

	const classMapping = {
		0: "danger",
		1: "danger",
		2: "warning",
		3: "success",
		4: "success"
	}

	let validityMessageElement = null

	let passwordProgress = 0
	let passwordProgressColor = "default"
	let passwordScore = 0

	export function isValid() {
		return passwordScore >= 3
	}

	function validatePassword(password) {
		return schema.validate(password)
	}

	function validityMessage(password) {
		const errors = schema.validate(password, {list: true})

		if (errors.length === 0) {
			return ""
		}

		return messageMap[errors[0]]
	}

	$: passwordElement && (removeInputEventListener() || addInputEventListener())

	function addInputEventListener() {
		passwordElement && passwordElement.addEventListener("input", onInput)
	}

	function removeInputEventListener() {
		passwordElement && passwordElement.removeEventListener("input", onInput)
	}

	async function onInput() {
		const val = passwordElement.value

		const valid = validatePassword(val)
		passwordScore = valid ? zxcvbn(val).score : 0

		validityMessageElement.innerHTML = validityMessage(val)
		// passwordElement.className = valid ? "input" : "input is-danger"

		// Update the password strength meter
		passwordProgress = mapping[passwordScore]
		passwordProgressColor = classMapping[passwordScore]
	}

	onDestroy(() => {
		removeInputEventListener()
	})
</script>

<BsProgress
	value={passwordProgress}
	color={passwordProgressColor}
	max="100"
/>
<span bind:this={validityMessageElement} class="help-block" id="validity-message"></span>
