export const elementEvents = {
	addEventListener: <K extends keyof HTMLElementEventMap>(
		_type: K,
		_listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
		_options?: boolean | AddEventListenerOptions,
	): void => {
		throw new Error("Function not implemented.");
	},
	removeEventListener: <K extends keyof HTMLElementEventMap>(
		_type: K,
		_listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
		_options?: boolean | EventListenerOptions,
	): void => {
		throw new Error("Function not implemented.");
	},
	dispatchEvent: (_event: Event): boolean => {
		throw new Error("Function not implemented.");
	},
};
