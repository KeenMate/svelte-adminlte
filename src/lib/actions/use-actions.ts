export default function useActions(node: HTMLElement, options?: ((node: HTMLElement) => any) | null | undefined) {
	if (!options) {
		return
	}

	return options(node)
}
