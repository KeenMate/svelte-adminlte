
<script>
  export let text = false;
</script>

<span class="input-group-prepend {$$props.class || ''}">
  {#if !text}
  <slot/>
  {:else}
  <div class="input-group-text"> 
    <slot/>
  </div>
  {/if}
  
</span>