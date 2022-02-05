<script>
	import {Card} from "../index"
  import RichTextEditor from "../src/form/input/RichTextEditor.svelte"

  let value = "<h1> HELLO </h1>"
</script>

<h1 class="test-class">
  This is the place for testing components

</h1>

<Card loading>
	<svelte:fragment slot="header">
		Loading card
	</svelte:fragment>

	<h1>
		Rich text Editor
	</h1>
	<RichTextEditor on:input={e => console.log(e.detail)} bind:value/>

	{value}
</Card>

<style>
  .test-class {
    color: red;
    font-weight: bolder;
  }

</style>
