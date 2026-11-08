export const elementAttributes = {
	getAttribute: (_qualifiedName: string): string | null => {
		throw new Error("Function not implemented.");
	},
	getAttributeNS: (
		_namespace: string | null,
		_localName: string,
	): string | null => {
		throw new Error("Function not implemented.");
	},
	getAttributeNames: (): string[] => {
		throw new Error("Function not implemented.");
	},
	getAttributeNode: (_qualifiedName: string): Attr | null => {
		throw new Error("Function not implemented.");
	},
	getAttributeNodeNS: (
		_namespace: string | null,
		_localName: string,
	): Attr | null => {
		throw new Error("Function not implemented.");
	},
	hasAttribute: (_qualifiedName: string): boolean => {
		throw new Error("Function not implemented.");
	},
	hasAttributeNS: (_namespace: string | null, _localName: string): boolean => {
		throw new Error("Function not implemented.");
	},
	hasAttributes: (): boolean => {
		throw new Error("Function not implemented.");
	},
	removeAttribute: (_qualifiedName: string): void => {
		throw new Error("Function not implemented.");
	},
	removeAttributeNS: (_namespace: string | null, _localName: string): void => {
		throw new Error("Function not implemented.");
	},
	removeAttributeNode: (_attr: Attr): Attr => {
		throw new Error("Function not implemented.");
	},
	setAttribute: (_qualifiedName: string, _value: string): void => {
		throw new Error("Function not implemented.");
	},
	setAttributeNS: (
		_namespace: string | null,
		_qualifiedName: string,
		_value: string,
	): void => {
		throw new Error("Function not implemented.");
	},
	setAttributeNode: (_attr: Attr): Attr | null => {
		throw new Error("Function not implemented.");
	},
	setAttributeNodeNS: (_attr: Attr): Attr | null => {
		throw new Error("Function not implemented.");
	},
	toggleAttribute: (_qualifiedName: string, _force?: boolean): boolean => {
		throw new Error("Function not implemented.");
	},
};
