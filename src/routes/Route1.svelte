<script>
  import { createForm } from "felte";

  import {FormGroup} from "../components/index";
  import CheckboxInput from "../components/form/input/CheckboxInput.svelte";
  import TextInput from "../components/form/input/TextInput.svelte";
  import Checkbox from "../components/form/structure/Checkbox.svelte";
  import Form from "../components/form/structure/Form.svelte";
  import InputGroup from "../components/form/structure/InputGroup.svelte";
  import InputGroupButton from "../components/form/structure/InputGroupButton.svelte";
  import Label from "../components/form/structure/Label.svelte";
  import LteButton from "../components/ui/LteButton.svelte";

  const { form } = createForm({
    onSubmit: async (val) => console.log(val),
  });
</script>

<Form {form} class="form-horizontal">
  <FormGroup>
    <Label class="col-sm-3" inputId="name">Name</Label>
    <div class="col-sm-9">
      <InputGroup>
        <TextInput type="text" id="name" name="name" />
        <InputGroupButton>
          <LteButton small>Go!</LteButton>
        </InputGroupButton>
      </InputGroup>
    </div>
  </FormGroup>

  <FormGroup>
    <Checkbox>
      <Label inputId="agreement">
        Agree
        <CheckboxInput id="agreement" name="agreement" title="Agreement" />
      </Label>
    </Checkbox>
  </FormGroup>
</Form>
