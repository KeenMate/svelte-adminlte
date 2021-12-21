<script>
  export let row = false;
  export let inline = false;
  export let collumn = false;
  export let justifyContent = null;
  export let alignItems = null;
  export let wrap = true;
  export let gap = null;
</script>

<div
  class:row
  class="{inline ? 'd-inline-flex' : 'd-flex'} 
	{justifyContent ? 'justify-content-' + justifyContent : ''} 
	{alignItems ? 'align-items-' + alignItems : ''}
	{wrap ? 'flex-wrap' : ''} 
	{justifyContent ? 'justify-content-' + justifyContent : ''} 
	{gap ? 'gap-' + gap : ''} 
	{$$props.class ||''}"
  class:flex-column={collumn}
>
  <slot />
</div>

<!-- <style>
.flex-container{
	display:flex;
	flex-wrap: wrap;
	gap: 0.3em;
	
}
</style> -->
