<script>
  export let text = false;
</script>

<span class="input-group-append {$$props.class || ''}">
  {#if !text}
  <slot/>
  {:else}
  <div class="input-group-text"> 
    <slot/>
  </div>
  {/if}
  
</span>