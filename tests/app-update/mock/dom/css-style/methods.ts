export const cssStyleMethods = {
	getPropertyPriority: (_property: string): string => {
		throw new Error("Function not implemented.");
	},
	getPropertyValue: (_property: string): string => {
		throw new Error("Function not implemented.");
	},
	item: (_index: number): string => {
		throw new Error("Function not implemented.");
	},
	removeProperty: (_property: string): string => {
		throw new Error("Function not implemented.");
	},
	setProperty: (
		_property: string,
		_value: string | null,
		_priority?: string,
	): void => {
		throw new Error("Function not implemented.");
	},
	[Symbol.iterator]: (): ArrayIterator<string> => {
		throw new Error("Function not implemented.");
	},
};
