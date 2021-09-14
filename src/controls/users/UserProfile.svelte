<script>
  import {
    TextInput,
    Form,
    FormGroup,
    Label,
    DateRangePicker,
    Multiselect,
    Dropdown,
    FileInput,
  } from "../../components";
  import SvelteSelect from "svelte-select";
  import InputGroup from "../../components/form/structure/InputGroup.svelte";
  import InputGroupPrepend from "../../components/form/structure/InputGroupPrepend.svelte";

  const categoryItems = [
    { value: "adventure", label: "Adventure" },
    { value: "action", label: "Action" },
    { value: "sci-fi", label: "Sci-Fi" },
    { value: "comedy", label: "Comedy" },
    { value: "drama", label: "Drama" },
  ];

  export let user;

  let dateRangePickerElement = null;
</script>

<Form>
  <div class="row">
    <div class="col-6">
      <FormGroup>
        <Label class="pb-1">First name</Label>
        <TextInput bind:value={user.firstName} />
      </FormGroup>
    </div>
    <div class="col-6">
      <FormGroup>
        <Label class="pb-1">Last name</Label>
        <TextInput bind:value={user.lastName} />
      </FormGroup>
    </div>
  </div>
  <div class="row">
    <div class="col-6">
      <FormGroup>
        <Label class="pb-1">Gender</Label>
        <Dropdown bind:value={user.gender}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Dropdown>
      </FormGroup>
    </div>
    <div class="col-6">
      <FormGroup>
        <Label class="pb-1">Birth date</Label>
        <DateRangePicker
          startDate={user.birthDay}
          singleDatePicker
          inputElement={dateRangePickerElement}
          on:change={({ detail: { date: d } }) => (user.birthDay = d.format("DD/MM/YYYY"))}
        >
          <InputGroup>
            <InputGroupPrepend>
              <span class="input-group-text">
                <i class="far fa-calendar-alt" />
              </span>
            </InputGroupPrepend>
            <TextInput bind:inputElement={dateRangePickerElement} />
          </InputGroup>
        </DateRangePicker>
      </FormGroup>
    </div>
  </div>
  <div class="row">
    <div class="col-6">
      <FormGroup>
        <Label class="pb-1">Avatar</Label>

        <FileInput bind:value={user.avatar}>Pick avatar...</FileInput>
      </FormGroup>
    </div>
    <div class="col-6">
      <FormGroup>
        <Label class="pb-1">Favorite categories</Label>
        <!-- <Multiselect value="" on:change={({ detail: d }) => console.log("select", d)}>
          <option value="adventure">Adventure</option>
          <option value="action">Action</option>
          <option value="sci-fi">Sci-Fi</option>
          <option value="comedy">Comedy</option>
          <option value="drama">Drama</option>
        </Multiselect> -->
        <div class="svelte-select">
          <SvelteSelect items={categoryItems} isMulti isCreatable />
        </div>
      </FormGroup>
    </div>
  </div>

  <div class="row">
    <div class="col-6">
      <FormGroup>
        <Label class="pb-1">Phone number</Label>
        <InputGroup>
          <InputGroupPrepend>
            <span class="input-group-text"><i class="fas fa-phone" /></span>
          </InputGroupPrepend>
          <TextInput inputMask="'mask': '999 999 999'" bind:value={user.phone} />
        </InputGroup>
      </FormGroup>
    </div>
  </div>
</Form>

<style>
  .svelte-select {
    /* --border: 3px solid blue; */
    --borderRadius: 4px;
    --height: 2.25rem;
    --multiItemBorderRadius: 8px;
    --multiSelectPadding: 0 25px 0 6px;
    --multiItemHeight: 26px;
    --multiClearTop: 6px;
    --clearSelectTop: 5px;
    /* --placeholderColor: blue; */
  }
</style>
