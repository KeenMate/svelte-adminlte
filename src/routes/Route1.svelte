<script>
  import { createForm } from "felte";

  import {
    FormGroup,
    CheckboxInput,
    TextInput,
    Checkbox,
    Form,
    InputGroup,
    InputGroupAppend,
    Label,
    LteButton,
    CheckboxLabel,
    Dropdown,
  } from "../components";

  const { form } = createForm({
    onSubmit: async (val) => console.log(val),
  });
</script>

<Form horizontal {form}>
  <FormGroup row>
    <Label class="col-form-label col-sm-3" inputId="name">Name</Label>
    <div class="col-sm-9">
      <InputGroup>
        <TextInput id="name" name="name" />
        <InputGroupAppend>
          <LteButton small>Go!</LteButton>
        </InputGroupAppend>
      </InputGroup>
    </div>
  </FormGroup>

  <FormGroup row>
    <div class="offset-sm-3 col-sm-9">
      <Checkbox>
        <CheckboxInput id="agreement" name="agreement" title="Agreement" />
        <CheckboxLabel inputId="agreement">Agree</CheckboxLabel>
      </Checkbox>
    </div>
  </FormGroup>

  <FormGroup row>
    <Label class="col-form-label col-sm-3" inputId="name">Name</Label>
    <div class="col-sm-9">
      <InputGroup>
        <Dropdown value="">
          <option>Option 1</option>
          <option>Option 1</option>
        </Dropdown>
        <InputGroupAppend>
          <LteButton small>Go!</LteButton>
        </InputGroupAppend>
      </InputGroup>
    </div>
  </FormGroup>
</Form>
