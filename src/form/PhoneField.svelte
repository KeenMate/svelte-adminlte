<script>
  import { createEventDispatcher } from "svelte";
  import PhonePrefixCombo from "../shared/PhonePrefixCombo.svelte";
  import FormInput from "./input/TextInput.svelte";
  import Label from "./structure/Label.svelte";

  const dispatch = createEventDispatcher();

  export let phone = "";

  let phonePrefix = "";
  let phoneNumber = "";

  $: updatePhonePrefix(phone);
  $: handleInput(phoneNumber);
  // $: fullPhoneNumber = `${(phonePrefix)}${phonePrefix && " "}${phoneNumber}`

  function onPhonePrefixChange(ev) {
    const { detail: newPrefix } = ev;
    if (phone != null && phone != "") {
      phonePrefix = newPrefix;
      dispatch("input", getFullPhoneNumber(phonePrefix, phoneNumber));
    }
  }

  function updatePhonePrefix(thePhone) {
    if (!thePhone) return;

    const [_, match] = new RegExp(/^(\+\d{1,3})?/).exec(thePhone);

    phonePrefix = match;
    if(phonePrefix){
      phoneNumber = thePhone.toString().substr(phonePrefix.length +1,thePhone.length-(phonePrefix.length +1))

    }
    else{
      phoneNumber = thePhone;
    }
  }

  function handleInput(phoneNumber) {
    phone = `${phonePrefix ? phonePrefix + " " : ""}${phoneNumber}`;

    dispatch("input", getFullPhoneNumber(phonePrefix, phoneNumber));
  }

  function getFullPhoneNumber(prefix, phone) {
    return `${(prefix)}${prefix && " "}${phone}`
  }
</script>

<div class="row">
  <div class="col-md-5">
    <PhonePrefixCombo value={phonePrefix} on:change={onPhonePrefixChange} />
  </div>
  <div class="col-md-7">
    <Label inputId="phone-number">
      <span>Phone</span>
    </Label>

    <FormInput
      bind:value={phoneNumber}
      name="phone"
      id="phone-number"
      type="tel"
      title="Enter phone in format: +123 123123123"
      placeholder="Your contact phone"
      maxlength = 9
    />
  </div>
</div>
