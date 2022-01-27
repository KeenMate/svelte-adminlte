<script>
  import RichTextEditor from "../src/form/input/RichTextEditor.svelte";
  let value = "<h1> HELLO </h1>"
</script>

<h1 >
  Rich text Editor

</h1>

<RichTextEditor on:input={e => console.log(e.detail)} bind:value/>

  {value}
