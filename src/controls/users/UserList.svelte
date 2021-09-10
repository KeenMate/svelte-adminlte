<script>
  import { createEventDispatcher, getContext } from "svelte";
  import { getUsers } from "../../providers/userProvider";
  import {
    Card,
    TableCondensed,
    LteButton,
    TextInput,
    Form,
    FormGroup,
    InputGroup,
    InputGroupAppend,
  } from "../../components";

  const { setLoading } = getContext("loader");

  const dispatch = createEventDispatcher();

  export let expanded;
  export let users = [];

  fetchUsers();

  async function fetchUsers() {
    setLoading(true);
    users = await getUsers();
    setLoading(false);
  }
</script>

<Card outline color="primary">
  <svelte:fragment slot="header">List</svelte:fragment>

  <!--<div slot="tools">
    <LteButton color="info" small on:click={() => dispatch("refresh")}>
      <i class="fas fa-sync" />
    </LteButton>
    <LteButton color="success" small on:click={() => dispatch("create")}>
      <i class="fas fa-plus" />
    </LteButton>
  </div> -->

  <Form horizontal>
    <FormGroup>
      <InputGroup>
        <TextInput placeholder="Search for user..." />
        <InputGroupAppend>
          <LteButton small><i class="fas fa-times" /></LteButton>
        </InputGroupAppend>
      </InputGroup>
    </FormGroup>
  </Form>

  <TableCondensed>
    <tr slot="headers">
      <th class="actions">Actions</th>
      <th>Username</th>
      {#if expanded}
        <th>First name</th>
        <th>Last name</th>
      {/if}
    </tr>

    <!-- {@debug tenants} -->

    {#each users as user}
      <tr>
        <td class="actions">
          <LteButton color="danger" xsmall on:click={() => onDelete(user)}>
            <i class="fas fa-trash" />
          </LteButton>
          <!-- <LteButton color="warning" xsmall on:click={() => onEdit(tenant)}>
            <i class="fas fa-pen-alt" />
          </LteButton> -->
        </td>
        <td class="title">
          <a href="#" on:click|preventDefault={() => dispatch("edit", user.userId)}>
            {user.username}
          </a>
        </td>
        {#if expanded}
          <td>{user.firstName}</td>
          <td>{user.lastName}</td>
        {/if}
      </tr>
    {/each}
  </TableCondensed>

  <ul class="pagination" slot="footer">
    <li class="page-item">
      <a href="#" class="page-link">Prev</a>
    </li>
    <li class="page-item active">
      <a href="#" class="page-link">1</a>
    </li>
    <li class="page-item">
      <a href="#" class="page-link">2</a>
    </li>
    <li class="page-item">
      <a href="#" class="page-link">3</a>
    </li>
    <li class="page-item">
      <a href="#" class="page-link">4</a>
    </li>
    <li class="page-item">
      <a href="#" class="page-link">Next</a>
    </li>
  </ul>
</Card>

<style scoped>
  .pagination {
    justify-content: flex-end;
  }
</style>