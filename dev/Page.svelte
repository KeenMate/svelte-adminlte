<script>
	import { Card } from "../index";
	import TreeView from "../src/ui/TreeView.svelte";

	let num = 0

	let tree = [
		{
			nodePath: "1",
			title: "1",
			__visual_state: "indeterminate",
			__useCallback: true,
			hasChildren: true,
		},
		{ nodePath: "2", title: "2" },

		{ nodePath: "3", title: "3", hasChildren: true, __expanded: true },
		{ nodePath: "3.1", title: "Hecarim" },
		{ nodePath: "3.2", title: "3.2", hasChildren: true, __expanded: false },
		{
			nodePath: "3.2.2",
			title: "Visage",
			__expanded: true,
			__selected: true,
			test: "test223",
		},
		{
			nodePath: "3.2.3",
			title: "Lycan",
			__expanded: true,
			__selected: true,
			test: "test223",
		},
		{
			nodePath: "3.2.4",
			title: "Bloodseeker",
			__expanded: true,
			__selected: true,
		},

		{ nodePath: "3.3", title: "3.3", hasChildren: true, __expanded: true },

		{
			nodePath: "3.3.1",
			title: "3.3.1",
			__expanded: true,
			__selected: false,
		},
		{ nodePath: "3.4", title: "	Omniknight" },
	];
	let dragAndDrop = true;
</script>

<Card>
	<svelte:fragment slot="header">
		TreeView drag and drop test
		<input type="checkbox" bind:checked={dragAndDrop} />
	</svelte:fragment>

	<TreeView
		bind:tree
		treeId="tree"
		let:node
		maxExpandedDepth={4}
		recursive
		checkboxes
		bind:filteredTree={tree}
		on:selection={(e) => console.log(e.detail)}
		on:expansion={(e) => console.log(e.detail)}
		bind:dragAndDrop
		expandCallback={(n) => {
			console.log("callback from "+n.nodePath);
			return {
				nodePath: "1." + ++num
			};
		}}
	>
		{node.nodePath}
	</TreeView>
</Card>

<style>
</style>
