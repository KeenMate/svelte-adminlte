<script>
  import LteButton from "../components/ui/LteButton.svelte";
  import { getConfig, setConfig } from "../config";

  import notification from "../providers/notificationProvider";
</script>

Root

<LteButton
  on:click={() => {
    setConfig({ Foo: "Henlo" });
  }}
>
  Set config
</LteButton>

<LteButton
  on:click={() => {
    let arr = null;

    console.log(arr.abc);
  }}
>
  Throw
</LteButton>

<LteButton
  on:click={() =>
    notification.success(
      " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sit amet maximus ex, et lacinia est. Nullam sed orci lectus. Vivamus id arcu mauris. Ut posuere aliquam ex vel elementum. Nam aliquet non nisi sed consectetur. Quisque varius ut magna nec iaculis. Cras volutpat augue pharetra ultricies hendrerit. Ut laoreet convallis dui. Proin dapibus iaculis turpis, in posuere nulla pulvinar id. ",
      "Notification title"
    )}
>
  Notify me
</LteButton>
