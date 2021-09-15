<script>
  import { createForm } from "felte";
  import { createValidator } from "@felte/validator-superstruct";
  import { svelteReporter, ValidationMessage } from '@felte/reporter-svelte';

  import { object, string, size } from "superstruct";

  import { createEventDispatcher } from "svelte";
  import { Modal, LteButton, ModalCloseButton, Form, FormGroup, Label, TextInput } from "../../components";

  const dispatch = createEventDispatcher();

  let show;
  let hide;

  export function openModal() {
    show();
  }

  const struct = object({
    manufacturer: size(string(), 1, Infinity),
    model: size(string(), 1, Infinity),
  });

  const { form } = createForm({
    extend: [createValidator(), svelteReporter],
    validateStruct: struct,
    onSubmit(values) {
      dispatch("add", values);
      hide();
    },
  });
</script>

<Modal bind:show bind:hide>
  <span slot="header">Add car</span>

  <Form id="add-car" {form}>
    <FormGroup>
      <Label>Manufacturer</Label>
      <TextInput name="manufacturer" id="manufacturer" />
    </FormGroup>
    <FormGroup>
      <Label>Model</Label>
      <TextInput name="model" id="model" />
    </FormGroup>
  </Form>

  <svelte:fragment slot="actions">
    <ModalCloseButton />
    <LteButton type="submit" form="add-car" color="success" small>Add</LteButton>
  </svelte:fragment>
</Modal>
