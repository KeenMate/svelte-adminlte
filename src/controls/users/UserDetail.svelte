<script>
  import { createEventDispatcher } from "svelte";
  import { getUser } from "../../providers/userProvider";

  import { Card, Tabs, TabItem, Loader, LteButton } from "../../components";
  import UserProfile from "./UserProfile.svelte";
  import UserOrders from "./UserOrders.svelte";

  const dispatch = createEventDispatcher();
  const emptyUser = { userId: "", firstName: "", lastName: "" };

  export let userId = null;

  let loading = false;

  let currentTab = "profile";
  let userTask = fetchUser();

  $: userTask = fetchUser(userId);

  async function fetchUser() {
    if (userId === null) {
      return emptyUser;
    }

    loading = true;
    let user = await getUser(userId);
    loading = false;

    return user;
  }
</script>

<Card outline tabs {loading} color="primary" headerClass="p-0 pt-1 border-bottom-0">
  <svelte:fragment slot="fullHeader">
    <Tabs>
      <li class="pt-2 px-3"><h3 class="card-title">Detail</h3></li>
      <TabItem active={currentTab === "profile"} on:click={() => (currentTab = "profile")}>Profile</TabItem>
      <TabItem active={currentTab === "orders"} on:click={() => (currentTab = "orders")}>Orders</TabItem>
      <div class="card-tools pull-right ml-auto">
        {#if currentTab === "profile"}
          <LteButton color="primary" small on:click={() => dispatch("save")}>
            <i class="fas fa-save" />
          </LteButton>
        {/if}

        <LteButton color="danger" small on:click={() => dispatch("close")}>
          <i class="fas fa-times" />
        </LteButton>
      </div>
    </Tabs>
  </svelte:fragment>

  <!-- <span slot="header">Detail</span> -->

  {#if currentTab === "profile"}
    {#await userTask}
      <!-- <div class="loader-parent">
        <div>
          <Loader />
        </div>
      </div> -->
      <UserProfile user={emptyUser} />
    {:then user}
      <UserProfile {user} />
    {/await}
  {:else if currentTab === "orders"}
    <UserOrders {userId} />
  {/if}
</Card>

<style lang="sass">
.loader-parent
	display: flex
	justify-content: center
	align-items: center
	min-height: 20vh

	& > *
		width: 4rem
		height: 4rem

</style>
