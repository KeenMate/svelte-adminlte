<script>
  import jQuery from "jquery";
  import ModalCloseButton from "../ui/ModalCloseButton.svelte";

  export let small = false;
  export let large = false;

  let modalElement = null;

  export function toggle() {
    jQuery(modalElement).modal("toggle");
  }

  export function show() {
    jQuery(modalElement).modal("show");
  }

  export function hide() {
    jQuery(modalElement).modal("hide");
  }
</script>

<div bind:this={modalElement} class="modal fade in">
  <div class="modal-dialog" class:modal-sm={small} class:modal-lg={large}>
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">
          <slot name="header" />
        </h4>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
      <div class="modal-footer">
        <slot name="actions">
          <ModalCloseButton />
        </slot>
      </div>
    </div>
    <!-- /.modal-content -->
  </div>
  <!-- /.modal-dialog -->
</div>
