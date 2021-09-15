<script>
  import {
    Card,
    TableCondensed,
    LteButton,
    TextInput,
    Form,
    FormGroup,
    InputGroup,
    InputGroupAppend,
    Badge,
  } from "../../components";
  import OneColumnNarrow from "../../components/structure/OneColumnNarrow.svelte";
  import LoadingRow from "../../components/tables/LoadingRow.svelte";
  import LteButtonRefresh from "../../components/ui/LteButtonRefresh.svelte";
  import { getUserOrders } from "../../providers/userProvider";

  export let userId = null;

  let orderTask = fetchOrders();

  $: orderTask = fetchOrders(userId);

  async function fetchOrders() {
    if (userId === null) {
      return [];
    }

    return await getUserOrders(userId);
  }
</script>

<div class="container">
  <div class="row">
    <div class="col-12">
      <Form horizontal>
        <FormGroup>
          <OneColumnNarrow>
            <InputGroup>
              <TextInput placeholder="Search for order..." />
              <InputGroupAppend>
                <LteButton small><i class="fas fa-times" /></LteButton>
              </InputGroupAppend>
            </InputGroup>
            <div class="small">
              <LteButtonRefresh on:click={() => (orderTask = fetchOrders())} />
            </div>
          </OneColumnNarrow>
        </FormGroup>
      </Form>
    </div>
  </div>

  <div class="row">
    <div class="col-12">
      <TableCondensed>
        <tr slot="headers">
          <th class="actions">Actions</th>
          <th>Order no.</th>
          <th>Item count</th>
          <th>Total price</th>
          <th>Status</th>
        </tr>
        {#await orderTask}
          <LoadingRow />
        {:then orders}
          {#each orders as order}
            <tr>
              <td class="actions">
                <LteButton color="danger" xsmall on:click={() => onDelete(order)}>
                  <i class="fas fa-trash fa-fw" />
                </LteButton>
                <!-- <LteButton color="warning" xsmall on:click={() => onEdit(tenant)}>
                <i class="fas fa-pen-alt" />
              </LteButton> -->
              </td>
              <td>{order.orderId}</td>
              <td>{order.itemCount}</td>
              <td>{order.totalPrice}</td>
              <td><Badge color="primary">{order.status}</Badge></td>
            </tr>
          {/each}
        {/await}
      </TableCondensed>
    </div>
  </div>
</div>
