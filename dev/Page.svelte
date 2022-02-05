<script>
	import {Card} from "../index"
</script>

<h1 class="test-class">
  This is the place for testing components

</h1>

<Card loading>
	<svelte:fragment slot="header">
		Loading card
	</svelte:fragment>
</Card>

<style>
  .test-class {
    color: red;
    font-weight: bolder;
  }

</style>
