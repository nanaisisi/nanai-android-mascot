export const elementSelectors = {
	closest: <K extends keyof HTMLElementTagNameMap>(
		_selector: K,
	): HTMLElementTagNameMap[K] | null => {
		throw new Error("Function not implemented.");
	},
	getElementsByClassName: (_classNames: string): HTMLCollectionOf<Element> => {
		throw new Error("Function not implemented.");
	},
	getElementsByTagName: <K extends keyof HTMLElementTagNameMap>(
		_qualifiedName: K,
	): HTMLCollectionOf<HTMLElementTagNameMap[K]> => {
		throw new Error("Function not implemented.");
	},
	getElementsByTagNameNS: (
		_namespaceURI: "http://www.w3.org/1999/xhtml",
		_localName: string,
	): HTMLCollectionOf<HTMLElement> => {
		throw new Error("Function not implemented.");
	},
	matches: (_selectors: string): boolean => {
		throw new Error("Function not implemented.");
	},
	webkitMatchesSelector: (_selectors: string): boolean => {
		throw new Error("Function not implemented.");
	},
	querySelector: <K extends keyof HTMLElementTagNameMap>(
		_selectors: K,
	): HTMLElementTagNameMap[K] | null => {
		throw new Error("Function not implemented.");
	},
	querySelectorAll: <K extends keyof HTMLElementTagNameMap>(
		_selectors: K,
	): NodeListOf<HTMLElementTagNameMap[K]> => {
		throw new Error("Function not implemented.");
	},
};
