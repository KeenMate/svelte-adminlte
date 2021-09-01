<script>
  import { createForm } from "felte";

  import {
    FormGroup,
    CheckboxInput,
    TextInput,
    Checkbox,
    Form,
    InputGroup,
    InputGroupButton,
    Label,
    LteButton,
  } from "../components";

  const { form } = createForm({
    onSubmit: async (val) => console.log(val),
  });
</script>

<Form class="form-horizontal" {form}>
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
