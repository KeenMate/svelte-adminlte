<script>
  import { Card, TableCondensed, LteButton } from "../components";

  export let users = [];
</script>

<Card>
  <span slot="header">List</span>

  <div slot="tools">
    <LteButton color="info" small on:click={() => dispatch("refresh")}>
      <i class="fas fa-sync" />
    </LteButton>
    <LteButton color="success" small on:click={() => dispatch("create")}>
      <i class="fas fa-plus" />
    </LteButton>
  </div>
  <TableCondensed>
    <tr slot="headers">
      <th>Název</th>
      <th class="actions">Akce</th>
    </tr>

    <!-- {@debug tenants} -->

    {#each users as user}
      <tr>
        <td class="title">
          <a href="#" on:click|preventDefault={() => onEdit(tenant)}>
            {user.name}
          </a>
        </td>
        <td class="actions">
          <LteButton color="danger" xsmall on:click={() => onDelete(tenant)}>
            <i class="fas fa-trash" />
          </LteButton>
          <!-- <LteButton color="warning" xsmall on:click={() => onEdit(tenant)}>
            <i class="fas fa-pen-alt" />
          </LteButton> -->
        </td>
      </tr>
    {/each}
  </TableCondensed>
</Card>
