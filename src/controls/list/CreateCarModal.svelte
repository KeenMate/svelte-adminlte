<script>
  import { createForm } from "felte";
  import { validator } from "@felte/validator-zod";
  import { svelteReporter, ValidationMessage } from "@felte/reporter-svelte";

  import * as zod from "zod";
  import { createEventDispatcher } from "svelte";
  import { Modal, LteButton, ModalCloseButton, Form, FormGroup, Label, TextInput } from "../../components";

  const dispatch = createEventDispatcher();

  let show;
  let hide;

  export function openModal() {
    show();
  }

  const schema = zod.object({
    manufacturer: zod.string().nonempty(),
    model: zod.string().nonempty(),
  });

  const { form } = createForm({
    extend: [validator, svelteReporter],
    validateSchema: schema,
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
      <ValidationMessage for="manufacturer" let:messages>
        <TextInput invalid={messages} name="manufacturer" id="manufacturer" />

        <span class="error invalid-feedback">{messages}</span>
      </ValidationMessage>
    </FormGroup>
    <FormGroup>
      <Label>Model</Label>
      <ValidationMessage for="model" let:messages>
        <TextInput invalid={messages} name="model" id="model" />

        <span class="error invalid-feedback">{messages}</span>
      </ValidationMessage>
    </FormGroup>
  </Form>

  <svelte:fragment slot="actions">
    <ModalCloseButton />
    <LteButton type="submit" form="add-car" color="success" small>Add</LteButton>
  </svelte:fragment>
</Modal>
