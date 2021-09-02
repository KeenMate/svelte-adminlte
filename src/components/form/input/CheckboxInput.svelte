<script>
  import { createEventDispatcher } from "svelte";

  export let checked = false;
  export let id = "";
  export let value = "";
  export let name = "";

  const dispatch = createEventDispatcher();

  function onClick(ev) {
    // setTimeout(() => {
    //   dispatch("change", ev.target.checked);
    //   ev.target.checked = !ev.target.checked;
    // }, 0);
  }

  function onKeydown(ev) {
    // if (!["Enter", " "].includes(ev.keyCode)) return;
    // dispatch("change", !ev.target.checked);
  }
</script>

<input
  class="form-check-input {$$props.class || ""}"
  type="checkbox"
  bind:checked
  {id}
  {value}
  {name}
  on:click={onClick}
  on:keydown={onKeydown}
/>
