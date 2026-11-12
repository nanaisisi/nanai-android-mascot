export interface MockElement {
	className: any;
	value?: string;
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

export function createMockElement(tag: string = "div"): MockElement {
	const children: MockElement[] = [];
	const listeners: Record<string, (event?: unknown) => void> = {};
	const element = {
		className: undefined,
		value: undefined,
		tagName: tag.toUpperCase(),
		_textContent: "",
		get textContent() {
			return this._textContent;
		},
		set textContent(val: string) {
			this._textContent = val;
		},
		_innerHTML: "",
		get innerHTML() {
			return this._innerHTML;
		},
		set innerHTML(val: string) {
			this._innerHTML = val;
		},
		style: {} as Record<string, string>,
		dataset: {} as Record<string, string>,
		children: children,
		childNodes: children,
		get lastChild() {
			return children.length > 0 ? children[children.length - 1] : null;
		},
		get firstChild() {
			return children.length > 0 ? children[0] : null;
		},
		parentNode: undefined as MockElement | undefined,
		_listeners: listeners,
		appendChild: function (node: MockElement): void {
			children.push(node);
			node.parentNode = this as MockElement;
		},
		removeChild: (node: MockElement): void => {
			const index = children.indexOf(node);
			if (index > -1) {
				children.splice(index, 1);
				node.parentNode = undefined;
			}
		},
		remove: function (): void {
			if (this.parentNode) {
				this.parentNode.removeChild(this as MockElement);
			}
		},
		setAttribute: (_name: string, _val: unknown): void => {},
		addEventListener: (type: string, cb: (event?: unknown) => void): void => {
			listeners[type] = cb;
		},
		removeEventListener: (
			type: string,
			cb: (event?: unknown) => void,
		): void => {
			if (listeners[type] === cb) {
				delete listeners[type];
			}
		},
		click: (): void => {
			if (listeners.click) listeners.click({ stopPropagation: () => {} });
		},
		mouseenter: (): void => {
			if (listeners.mouseenter)
				listeners.mouseenter({ stopPropagation: () => {} });
		},
		mouseleave: (): void => {
			if (listeners.mouseleave)
				listeners.mouseleave({ stopPropagation: () => {} });
		},
		focus: (): void => {
			if (listeners.focus) listeners.focus({ stopPropagation: () => {} });
		},
		blur: (): void => {
			if (listeners.blur) listeners.blur({ stopPropagation: () => {} });
		},
	};
	return element as unknown as MockElement;
}

export function setupMockDOM() {
	(globalThis as Record<string, unknown>).window = globalThis;
	(globalThis as Record<string, unknown>).document = {
		createElement: createMockElement,
		addEventListener(_type: string, _cb: (event?: unknown) => void) {},
		removeEventListener(_type: string, _cb: (event?: unknown) => void) {},
		body: createMockElement("body"),
		getElementById: () => createMockElement("div"),
		querySelector: () => createMockElement("div"),
	};
}

setupMockDOM();
