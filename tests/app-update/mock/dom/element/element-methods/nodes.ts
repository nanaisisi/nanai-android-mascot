export const elementNodes = {
	appendChild: <T extends Node>(_node: T): T => {
		throw new Error("Function not implemented.");
	},
	cloneNode: (_subtree?: boolean): Node => {
		throw new Error("Function not implemented.");
	},
	compareDocumentPosition: (_other: Node): number => {
		throw new Error("Function not implemented.");
	},
	contains: (_other: Node | null): boolean => {
		throw new Error("Function not implemented.");
	},
	getRootNode: (_options?: GetRootNodeOptions): Node => {
		throw new Error("Function not implemented.");
	},
	hasChildNodes: (): boolean => {
		throw new Error("Function not implemented.");
	},
	insertBefore: <T extends Node>(_node: T, _child: Node | null): T => {
		throw new Error("Function not implemented.");
	},
	isDefaultNamespace: (_namespace: string | null): boolean => {
		throw new Error("Function not implemented.");
	},
	isEqualNode: (_otherNode: Node | null): boolean => {
		throw new Error("Function not implemented.");
	},
	isSameNode: (_otherNode: Node | null): boolean => {
		throw new Error("Function not implemented.");
	},
	lookupNamespaceURI: (_prefix: string | null): string | null => {
		throw new Error("Function not implemented.");
	},
	lookupPrefix: (_namespace: string | null): string | null => {
		throw new Error("Function not implemented.");
	},
	normalize: (): void => {
		throw new Error("Function not implemented.");
	},
	removeChild: <T extends Node>(_child: T): T => {
		throw new Error("Function not implemented.");
	},
	replaceChild: <T extends Node>(_node: Node, _child: T): T => {
		throw new Error("Function not implemented.");
	},
	after: (..._nodes: (Node | string)[]): void => {
		throw new Error("Function not implemented.");
	},
	before: (..._nodes: (Node | string)[]): void => {
		throw new Error("Function not implemented.");
	},
	remove: (): void => {
		throw new Error("Function not implemented.");
	},
	replaceWith: (..._nodes: (Node | string)[]): void => {
		throw new Error("Function not implemented.");
	},
	append: (..._nodes: (Node | string)[]): void => {
		throw new Error("Function not implemented.");
	},
	prepend: (..._nodes: (Node | string)[]): void => {
		throw new Error("Function not implemented.");
	},
	replaceChildren: (..._nodes: (Node | string)[]): void => {
		throw new Error("Function not implemented.");
	},
	insertAdjacentElement: (
		_where: InsertPosition,
		_element: Element,
	): Element | null => {
		throw new Error("Function not implemented.");
	},
	insertAdjacentHTML: (_position: InsertPosition, _string: string): void => {
		throw new Error("Function not implemented.");
	},
	insertAdjacentText: (_where: InsertPosition, _data: string): void => {
		throw new Error("Function not implemented.");
	},
	setHTMLUnsafe: (_html: string): void => {
		throw new Error("Function not implemented.");
	},
};
