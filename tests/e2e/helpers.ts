export interface MockElement {
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
	return {
		tagName: String(tag || "").toUpperCase(),
		_textContent: "",
		get textContent() {
			if (this.children.length === 0) return this._textContent;
			return this.children
				.map((c) =>
					typeof c === "string" ? c : (c.textContent ?? c.innerHTML ?? ""),
				)
				.join("");
		},
		set textContent(val: string) {
			this._textContent = val;
			this.children.length = 0;
			this._innerHTML = val;
		},
		_innerHTML: "",
		get innerHTML() {
			if (this.children.length === 0) return this._innerHTML;
			return this.children
				.map((c) =>
					typeof c === "string" ? c : (c.innerHTML ?? c.textContent ?? ""),
				)
				.join("");
		},
		set innerHTML(val: string) {
			this._innerHTML = val;
			this._textContent = val;
			this.children.length = 0;
		},
		style: {},
		dataset: {},
		children,
		childNodes: children,
		get lastChild() {
			return children[children.length - 1] || null;
		},
		appendChild(node: MockElement) {
			node.parentNode = this;
			children.push(node);
		},
		removeChild(node: MockElement) {
			const idx = children.indexOf(node);
			if (idx !== -1) {
				children.splice(idx, 1);
			}
		},
		remove() {
			if (this.parentNode) {
				this.parentNode.removeChild(this);
			}
		},
		setAttribute(name: string, val: unknown) {
			(this as Record<string, unknown>)[name] = val;
		},
		addEventListener(type: string, cb: (event?: unknown) => void) {
			this._listeners = this._listeners || {};
			this._listeners[type] = cb;
		},
		removeEventListener(_type: string, _cb: (event?: unknown) => void) {},
		click() {
			this._listeners?.click?.({ stopPropagation() {} });
		},
		mouseenter() {
			this._listeners?.mouseenter?.();
		},
		mouseleave() {
			this._listeners?.mouseleave?.();
		},
		focus() {},
		blur() {},
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
