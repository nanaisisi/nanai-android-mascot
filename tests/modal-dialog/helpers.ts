export interface MockDialogElement {
	tagName: string;
	className: string;
	style: Record<string, string>;
	value: string;
	placeholder: string;
	maxLength: number;
	min: string;
	max: string;
	rows: number;
	type: string;
	textContent: string;
	children: MockDialogElement[];
	dataset: Record<string, string>;
	removed?: boolean;
	focused?: boolean;
	accept?: string;
	files?: Array<{ name: string; path?: string }>;
	scrollIntoView?: () => void;
	_listeners?: Record<string, (e?: unknown) => unknown>;
	[key: string]: unknown;
	appendChild(child: MockDialogElement): void;
	remove(): void;
	setAttribute(name: string, val: unknown): void;
	getAttribute(name: string): string | undefined;
	addEventListener(type: string, cb: (e?: unknown) => unknown): void;
	click(): void;
	focus(): void;
}

export interface MockBalloonContainer {
	child?: MockDialogElement;
	appendChild(child: MockDialogElement): void;
}

export const createdElements: MockDialogElement[] = [];

export function resetCreatedElements() {
	createdElements.length = 0;
}

export function asMockElement(el: unknown): MockDialogElement {
	return el as MockDialogElement;
}

export function createMockElement(tag?: string): MockDialogElement {
	const el: MockDialogElement = {
		tagName: String(tag || "").toUpperCase(),
		className: "",
		style: {},
		value: "",
		placeholder: "",
		maxLength: 0,
		min: "",
		max: "",
		rows: 0,
		type: "",
		textContent: "",
		children: [],
		dataset: {},
		appendChild(child: MockDialogElement) {
			this.children.push(child);
		},
		remove() {
			this.removed = true;
		},
		setAttribute(name: string, val: unknown) {
			this[name] = val;
		},
		getAttribute(name: string) {
			const v = this[name];
			return v === undefined ? undefined : String(v);
		},
		addEventListener(type: string, cb: (e?: unknown) => unknown) {
			this._listeners = this._listeners || {};
			this._listeners[type] = cb;
		},
		click() {
			this._listeners?.click?.({ stopPropagation() {} });
		},
		focus() {
			this.focused = true;
		},
	};
	createdElements.push(el);
	return el;
}

export function setupMockDom() {
	globalThis.window = globalThis as unknown as Window & typeof globalThis;
	globalThis.document = {
		createElement(tag: string) {
			return createMockElement(tag) as unknown as HTMLElement;
		},
	} as unknown as Document;
}

setupMockDom();
