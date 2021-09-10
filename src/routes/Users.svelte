<script>
  import UserDetail from "../controls/users/UserDetail.svelte";
  import UserList from "../controls/users/UserList.svelte";
  import UserOrders from "../controls/users/UserOrders.svelte";

  let selectedUserId = null;
</script>

<div class="row">
  <div class:col-12={!selectedUserId} class:col-6={selectedUserId}>
    <UserList expanded={!selectedUserId} on:edit={({ detail: userId }) => (selectedUserId = userId)} />
  </div>
  {#if selectedUserId}
    <div class="col-6">
      <UserDetail userId={selectedUserId} on:close={() => (selectedUserId = null)} />
    </div>
  {/if}
</div>
