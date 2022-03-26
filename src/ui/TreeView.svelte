<script>
	/* Tree view helpers */

	function getParentNodePath(nodePath) {
		return nodePath.substring(0, nodePath.lastIndexOf("."));
	}

	function hasChildren(tree, nodePath) {
		return tree.find((x) => getParentNodePath(x.nodePath) === nodePath);
	}

	function findNestedLtreePath(tree, nodePath) {
		if (!nodePath) return [];

		const parents = getLtreeParents(nodePath);

		return tree.filter((x) => parents.includes(x.nodePath));
	}

	function getLtreeParents(nodePath, acc = []) {
		const parentNodePath = getParentNodePath(nodePath);

		return (
			(!parentNodePath && acc) ||
			getLtreeParents(parentNodePath, [parentNodePath, ...acc])
		);
	}

	function nodePathIsChild(nodePath) {
		return !nodePath || !!(nodePath.match(/\./g) || []).length;
	}

	function getParentChildrenTree(tree, parentId, isChild, getParentId) {
		return (tree || []).filter((x) =>
			!parentId ? !isChild(x) : getParentId(x) === parentId
		);
	}

	function allCHildren(tree, parentId, isChild) {
		let children;
		children = tree.filter((x) => {
			if (!parentId) {
				//top level
				return !isChild(x);
			} else {
				return x.nodePath.startsWith(parentId.toString());
			}
		});
		return children;
	}

	function getAllLeafNodes(tree) {
		return tree.filter((x) => {
			return x.hasChildren == undefined || x.hasChildren == false;
		});
	}

	function joinTrees(filteredTree, tree) {
		return tree.map(
			(tnode) =>
				filteredTree.find((fnode) => tnode.nodePath === fnode.nodePath) || tnode
		);
	}

	//* selection

	function ChangeSelection(
		recursiveely,
		tree,
		nodePath,
		isChild,
		selectedProperty,
		getParentId,
		filteredTree
	) {
		if (!recursiveely) {
			//non recursiveely

			return addOrRemoveSelection(tree, nodePath, selectedProperty);
		} else {
			//recursiveely

			//only allow selection if it doesnt have any children
			tree = addOrRemoveSelection(tree, nodePath, selectedProperty);
			return recomputeAllParentVisualState(
				tree,
				nodePath,
				isChild,
				selectedProperty,
				getParentId,
				filteredTree
			);
		}
	}

	function addOrRemoveSelection(tree, nodePath, selectedProperty) {
		return tree.map((x) => {
			let t = x;
			if (x.nodePath == nodePath) {
				t[selectedProperty] = !x[selectedProperty];
				t.__visual_state = !x[selectedProperty];
			}
			return t;
		});
	}

	function changeExpansion(tree, nodePath, expandedProperty) {
		return tree.map((x) => {
			let t = x;
			if (x.nodePath == nodePath) {
				t[expandedProperty] = !x[expandedProperty];
			}
			return t;
		});
	}

	function ChangeSelectForAllChildren(
		tree,
		parentId,
		isChild,
		selectedProperty,
		changeTo,
		getParentId,
		filteredTree
	) {
		tree = tree.map((x) => {
			//changes itself
			if (parentId == x.nodePath) {
				x = changeSelectedIfNParent(x, selectedProperty, changeTo);
			}

			if (!parentId) {
				//top level
				if (!isChild(x)) {
					x = changeSelectedIfNParent(x, selectedProperty, changeTo);
				}
			} else {
				//if parentId isnt root
				if (
					x.nodePath.startsWith(parentId.toString()) &&
					x.nodePath != parentId.toString()
				) {
					x = changeSelectedIfNParent(x, selectedProperty, changeTo);
				}
			}
			return x;
		});
		tree = recomputeAllParentVisualState(
			tree,
			parentId,
			isChild,
			selectedProperty,
			getParentId,
			filteredTree
		);
		return tree;
	}

	//changes selectedproperty or visual state depending on
	function changeSelectedIfNParent(node, selectedProperty, changeTo) {
		if (!node.hasChildren) {
			node[selectedProperty] = changeTo;
		} else {
			node.__visual_state = changeTo.toString();
		}
		return node;
	}

	function getVisualState(
		filteredTree,
		node,
		isChild,
		selectedProperty,
		getParentId
	) {
		let children = getParentChildrenTree(
			filteredTree,
			node.nodePath,
			isChild,
			getParentId
		);
		//if every child is selected or vs=true return true
		if (
			children.every((x) => {
				return x[selectedProperty] === true || x.__visual_state === "true";
			})
		) {
			return "true";
		}
		//not every child but at least one return indeterminate
		else if (
			children.some((x) => {
				return (
					x[selectedProperty] === true ||
					x.__visual_state === "indeterminate" ||
					x.__visual_state === "true"
				);
			})
		) {
			return "indeterminate";
		} else {
			return "false";
		}
	}

	//changes status of all parents of given nodepath until root
	function recomputeAllParentVisualState(
		tree,
		nodePath,
		isChild,
		selectedProperty,
		getParentId,
		filteredTree
	) {
		let parent = getParentId({ nodePath: nodePath });

		let newstate;
		filteredTree.forEach((x) => {
			if (x.nodePath == parent) {
				newstate = getVisualState(
					filteredTree,
					x,
					isChild,
					selectedProperty,
					getParentId
				);
				x.__visual_state = newstate;
				console.log("recomputing" + parent + " ->" + newstate);
			}
		});
		if (getParentNodePath(parent) != "") {
			tree = recomputeAllParentVisualState(
				tree,
				parent,
				isChild,
				selectedProperty,
				getParentId,
				filteredTree
			);
		}
		return tree;
	}

	//computes visual states for all nodes with children
	function computeInitialVisualStates(
		tree,
		isChild,
		selectedProperty,
		getParentId,
		filteredTree
	) {
		let rootELements = getParentChildrenTree(tree, null, isChild, getParentId);
		rootELements.forEach((x) => {
			if (x.hasChildren == true) {
				tree = computeChildrenVisualStates(
					tree,
					x,
					isChild,
					selectedProperty,
					getParentId,
					filteredTree
				);
				x.__visual_state = getVisualState(
					filteredTree,
					x,
					isChild,
					selectedProperty,
					getParentId
				);
			}
		});
		return tree;
	}

	function computeChildrenVisualStates(
		tree,
		node,
		isChild,
		selectedProperty,
		getParentId,
		filteredTree
	) {
		let children = getParentChildrenTree(
			tree,
			node.nodePath,
			isChild,
			getParentId
		);
		//foreaches all children if it has children, it calls itself, then it computes __vs => will compute from childern to parent
		children.forEach((x) => {
			if (x.hasChildren == true) {
				tree = computeChildrenVisualStates(
					tree,
					x,
					isChild,
					selectedProperty,
					getParentId,
					filteredTree
				);
				x.__visual_state = getVisualState(
					filteredTree,
					x,
					isChild,
					selectedProperty,
					getParentId
				);
			}
		});
		return tree;
	}

	function deleteSelected(tree) {
		return tree.map((t) => {
			let x = t;
			x.__selected = false;
			x.__visual_state = "false";
			return x;
		});
	}

	//* drag and drop

	function moveNode(tree, movedNodePath, targetNodePath) {
		//trying to move parent to child
		if (targetNodePath.startsWith(movedNodePath)) return;

		let newParrenId = getNextNodeId(tree,targetNodePath)

		tree = tree.map((node) => {
			//change haschildren to true on target to show plus icon
			if(node.nodePath == targetNodePath)
				node.hasChildren = true;

			//move nodes to target
			if (node.nodePath.startsWith(movedNodePath)) {
				//replace
				let newPath = node.nodePath.replace(
					movedNodePath,
					targetNodePath + "." + newParrenId
				);

				console.log(targetNodePath + "|.|" + newParrenId)
				console.log(node.nodePath + " -> " + newPath);
				node.nodePath = newPath;
				return node;
			}

			return node;
		});

		return tree;
	}

	//return biggest value of nodepath number that children are using +1
	function getNextNodeId(tree,parentPath){
		let max = 0
		tree.forEach(
			node => {
				let parent = getParentNodePath(node.nodePath)
				if(parent == parentPath){
					let num = node.nodePath.substring(parent.length+1)

					if(num > max)
						max = num
				}
			}
		)
		console.log(parseInt(max)+1)
		return (parseInt(max)+1)
	}

	/* Tree view helpers end */

	//required
	export let tree = null;
	export let filteredTree;
	export let treeId = null;

	export let maxExpandedDepth = 0;

	export let recursive = false;
	export let checkboxes = false;
	//if true, will show checkboxes to elements with children
	export let leafNodeCheckboxesOnly = false;
	//true = disabel hide = false
	export let disableOrHide = false;

	export let childDepth = 0;
	export let parentId = null;
	//path of currently dragged node
	export let draggedPath = null;

	export let expandedProperty = "__expanded";
	export let selectedProperty = "__selected";

	export let getId = (x) => x.nodePath;
	export let getParentId = (x) => getParentNodePath(x.nodePath);
	export let isChild = (x) => nodePathIsChild(x.nodePath);

	const getNodeId = (node) => `${treeId}-${getId(node)}`;

	$: parentChildrenTree = getParentChildrenTree(
		filteredTree === undefined ? tree : filteredTree,
		parentId,
		isChild,
		getParentId
	);
	$: ComputeVisualTree(filteredTree);
	$: parsedMaxExpandedDepth = Number(maxExpandedDepth ?? 0);

	function ComputeVisualTree(filteredTree) {
		tree = computeInitialVisualStates(
			tree,
			isChild,
			selectedProperty,
			getParentId,
			filteredTree
		);
	}

	function expandNodes(nodes) {
		if (!nodes || !nodes.length) return;
		nodes.forEach((x) => toggleExpansion(x, true));
	}

	function toggleExpansion(node, setValueTo = null) {
		tree = changeExpansion(tree, node.nodePath, expandedProperty);
	}

	function recomputeExpandedNodes() {
		if (childDepth < parsedMaxExpandedDepth) {
			expandNodes(parentChildrenTree);
		}
	}

	//checkboxes
	function selectionChanged(nodePath) {
		//console.log(nodePath);
		tree = ChangeSelection(
			recursive,
			tree,
			nodePath,
			isChild,
			selectedProperty,
			getParentId,
			filteredTree
		);
	}

	//selectes
	function selectChildren(node, e) {
		tree = ChangeSelectForAllChildren(
			tree,
			getId(node),
			isChild,
			selectedProperty,
			e.target.checked,
			getParentId,
			filteredTree
		);
	}

	function handleDragStart(e, node) {
		console.log("dragstart from: " + node.nodePath);
		e.dataTransfer.dropEffect = "move";
		e.dataTransfer.setData("node_id", node.nodePath);
		draggedPath = node.nodePath;
	}
	function handleDragDrop(e, node) {
		let draggedPath = e.dataTransfer.getData("node_id");
		console.log(draggedPath + " dropped on: " + node.nodePath);
		tree = moveNode(tree, draggedPath, node.nodePath);
		draggedPath = null;
	}
	function handleDragOver(e, node) {
		//console.log( draggedPath + "dragged over: "+ node.nodePath)

		//if you arent dropping parent to child allow drop
		if (!node.nodePath.startsWith(draggedPath)) e.preventDefault();
	}

	//computes all visual states when component is first created
	tree = computeInitialVisualStates(
		tree,
		isChild,
		selectedProperty,
		getParentId,
		filteredTree
	);
</script>

<ul class:treeview={childDepth === 0} class:child-menu={childDepth > 0}>
	{#each parentChildrenTree as node (getNodeId(node))}
		<li class:is-child={isChild(node)} class:has-children={node.hasChildren}>
			<div
				class="tree-item"
				class:div-has-children={node.hasChildren}
				draggable="true"
				on:dragstart={(e) => handleDragStart(e, node)}
				on:drop={(e) => handleDragDrop(e, node)}
				on:dragover={(e) => handleDragOver(e, node)}
				on:dragenter={(e) => e.preventDefault()}
				on:dragend={(e) => (draggedPath = null)}
			>
				{#if node.hasChildren}
					<span on:click={() => toggleExpansion(node)}>
						<i
							class="far"
							class:fa-minus-square={node[expandedProperty]}
							class:fa-plus-square={!node[expandedProperty]}
						/>
					</span>
				{:else}
					<span />
				{/if}
				{#if checkboxes}
					{#if recursive}
						{#if !hasChildren(tree, node.nodePath)}
							<input
								type="checkbox"
								id={getNodeId(node)}
								on:change={() => selectionChanged(node.nodePath)}
								checked={node[selectedProperty] ? "false" : ""}
							/>
						{:else if !leafNodeCheckboxesOnly}
							<input
								type="checkbox"
								id={getNodeId(node)}
								on:click={(e) => {
									e.preventDefault;
									selectChildren(node, e);
								}}
								checked={node.__visual_state == "true" ? "false" : ""}
								indeterminate={node.__visual_state == "indeterminate"}
							/>
						{:else if disableOrHide}
							<input
								type="checkbox"
								id={getNodeId(node)}
								onclick="return false;"
								disabled={true}
							/>
						{:else}
							<input
								type="checkbox"
								id={getNodeId(node)}
								onclick="return false;"
								class:invisible={!disableOrHide}
							/>
						{/if}
					{:else}
						<input
							type="checkbox"
							id={getNodeId(node)}
							on:change={() => selectionChanged(node.nodePath)}
							checked={node[selectedProperty] ? "false" : ""}
						/>
					{/if}
				{/if}
				<slot {node} />
			</div>
			<!--{@debug node}-->
			<!--{@debug $_expansionState}-->
			{#if node[expandedProperty] && node.hasChildren}
				<!--tree={tree/*.filter(x => x.nodePath.startsWith(node.nodePath) && x.nodePath !== node.nodePath)*/} -->
				<svelte:self
					{treeId}
					{getId}
					{checkboxes}
					{getParentId}
					{maxExpandedDepth}
					bind:tree
					bind:filteredTree
					{recursive}
					childDepth={childDepth + 1}
					parentId={getId(node)}
					let:node={nodeNested}
					{leafNodeCheckboxesOnly}
					{disableOrHide}
					bind:draggedPath
				>
					<slot node={nodeNested} />
				</svelte:self>
			{/if}
			{#if node[expandedProperty] != true && node.hasChildren}
				<ul class:child-menu={childDepth > 0} />
			{/if}
		</li>
	{/each}
</ul>

<style lang="sass">
	$treeview-lines: dotted black 1px

	:global
		.treeview
			padding-left: 1em

			> :first-child
				//border-left: none
				padding-left: 1px

			ul, li
				list-style: none
				margin: 0
				padding: 0

			ul
				margin-left: 1.5em

			li

				border: $treeview-lines
				border-width: 0 0 1px 1px

				&:last-child > ul
					border-left: 1px solid white

				div
					margin-left: 0


				ul
					border-top: $treeview-lines
					margin-left: -1px
					padding-left: 1.25em
					border-left: none

			.has-children
				border-bottom: 0px

			.tree-item
				display: flex
				column-gap: 0.4em
				align-items: center
				background: white
				position: relative
				top: 0.75em
				margin-left: 26px

			.div-has-children
				margin-left: 12px

			.no-arrow
				padding-left: .5rem

			.arrow
				cursor: pointer
				display: inline-block

			.arrowDown
				transform: rotate(90deg)

			.invisible
				visibility: none
</style>
