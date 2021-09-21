<script>
  import LteButton from "../components/ui/LteButton.svelte";
  import { getConfig, setConfig } from "../config";
  import toastr from "../helpers/toastr-helpers";
</script>

Root

<LteButton
  on:click={() => {
    setConfig({ Foo: "Henlo" });
    toastr.success(getConfig().Foo);
  }}
>
  Set config
</LteButton>
