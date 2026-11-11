export interface MockElement {
	className: any;
	value(value: any, arg1: string): unknown;
	tagName: string;
	_textContent: string;
	textContent: string;
	_innerHTML: string;
	innerHTML: string;
	style: Record<string, string>;
	dataset: Record<string, string>;
	children: MockElement[];
	childNodes: MockElement[];
	lastChild: MockElement | null;
	parentNode?: MockElement;
	_listeners?: Record<string, (event?: unknown) => void>;
	appendChild(node: MockElement): void;
	removeChild(node: MockElement): void;
	remove(): void;
	setAttribute(name: string, val: unknown): void;
	addEventListener(type: string, cb: (event?: unknown) => void): void;
	removeEventListener(type: string, cb: (event?: unknown) => void): void;
	click(): void;
	mouseenter(): void;
	mouseleave(): void;
	focus(): void;
	blur(): void;
}

export function createMockElement(_tag: string = "div"): MockElement {
	const _children: MockElement[] = [];
	return {
		className: undefined,
		value: (_value: any, _arg1: string): unknown => {
			throw new Error("Function not implemented.");
		},
		tagName: "",
		_textContent: "",
		textContent: "",
		_innerHTML: "",
		innerHTML: "",
		style: undefined,
		dataset: undefined,
		children: [],
		childNodes: [],
		lastChild: null,
		appendChild: (_node: MockElement): void => {
			throw new Error("Function not implemented.");
		},
		removeChild: (_node: MockElement): void => {
			throw new Error("Function not implemented.");
		},
		remove: (): void => {
			throw new Error("Function not implemented.");
		},
		setAttribute: (_name: string, _val: unknown): void => {
			throw new Error("Function not implemented.");
		},
		addEventListener: (_type: string, _cb: (event?: unknown) => void): void => {
			throw new Error("Function not implemented.");
		},
		removeEventListener: (
			_type: string,
			_cb: (event?: unknown) => void,
		): void => {
			throw new Error("Function not implemented.");
		},
		click: (): void => {
			throw new Error("Function not implemented.");
		},
		mouseenter: (): void => {
			throw new Error("Function not implemented.");
		},
		mouseleave: (): void => {
			throw new Error("Function not implemented.");
		},
		focus: (): void => {
			throw new Error("Function not implemented.");
		},
		blur: (): void => {
			throw new Error("Function not implemented.");
		},
	};
}

export function setupMockDOM() {
	(globalThis as Record<string, unknown>).window = globalThis;
	(globalThis as Record<string, unknown>).document = {
		createElement: createMockElement,
		addEventListener(_type: string, _cb: (event?: unknown) => void) {},
		removeEventListener(_type: string, _cb: (event?: unknown) => void) {},
	};
}

setupMockDOM();
